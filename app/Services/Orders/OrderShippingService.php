<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\OrderShipping;
use App\Models\ShippingMethod;
use Illuminate\Support\Facades\DB;

class OrderShippingService
{
    public function updateShippingPrice(Order $order, mixed $shippingPrice): void
    {
        $shippingPrice = $shippingPrice === null || $shippingPrice === ''
            ? null
            : number_format((float) $shippingPrice, 2, '.', '');
        $subtotal = $order->subtotal !== null
            ? (float) $order->subtotal
            : (float) $order->orderItems()->selectRaw('COALESCE(SUM(final_price * quantity), 0) as aggregate')->value('aggregate');

        $order->update([
            'subtotal' => number_format($subtotal, 2, '.', ''),
            'shipping_price' => $shippingPrice,
            'total' => number_format($subtotal + (float) ($shippingPrice ?? 0), 2, '.', ''),
        ]);
    }

    public function updateShipping(
        Order $order,
        OrderShipping $shipping,
        array $validated,
        ?ShippingMethod $shippingMethod,
    ): void {
        $submittedValues = $this->shippingValuesByKey($validated['customer_settings']);
        $methodChanged = $shippingMethod
            && (int) $shippingMethod->id !== (int) ($shipping->shipping_method_id ?? 0);

        $customerSettings = $methodChanged
            ? $this->normalizeCustomerSettings($shippingMethod->customer_settings, $submittedValues)
            : $this->normalizeCustomerSettings($shipping->customer_settings, $submittedValues);

        $newShippingMethodId = $methodChanged ? $shippingMethod->id : $shipping->shipping_method_id;
        $newShippingMethodName = $methodChanged
            ? $shippingMethod->methodConstructor?->name
            : $shipping->shipping_method_name;
        $oldAuditValues = $this->shippingAuditValues(
            $shipping->name,
            $shipping->phone,
            $shipping->note,
            $shipping->shipping_method_name,
            $this->normalizeCustomerSettings($shipping->customer_settings),
        );
        $newAuditValues = $this->shippingAuditValues(
            trim($validated['name']),
            trim((string) ($validated['phone'] ?? '')),
            trim((string) ($validated['note'] ?? '')),
            $newShippingMethodName,
            $customerSettings,
        );

        $shipping->fill([
            'name' => trim($validated['name']),
            'phone' => trim((string) ($validated['phone'] ?? '')),
            'note' => trim((string) ($validated['note'] ?? '')),
            'shipping_method_id' => $newShippingMethodId,
            'shipping_method_name' => $newShippingMethodName,
            'customer_settings' => $customerSettings,
        ]);

        DB::transaction(function () use ($order, $shipping, $shippingMethod, $methodChanged, $oldAuditValues, $newAuditValues) {
            $shipping->save();

            if ($methodChanged && $shippingMethod) {
                $this->updateShippingPrice($order, $this->shippingPriceFromMethod($shippingMethod));
            }

            $this->recordShippingAudit($order, $oldAuditValues, $newAuditValues);
        });
    }

    /**
     * Normalize customer shipping fields from storefront/order snapshots.
     */
    public function normalizeCustomerSettings(?array $settings, array $valuesByKey = []): array
    {
        return collect(is_array($settings) ? $settings : [])
            ->filter(fn ($field) => is_array($field) && is_scalar($field['key'] ?? null) && is_scalar($field['name'] ?? null))
            ->map(function (array $field) use ($valuesByKey) {
                $key = (string) $field['key'];
                $value = array_key_exists($key, $valuesByKey)
                    ? $valuesByKey[$key]
                    : ($field['value'] ?? '');

                return [
                    'key' => $key,
                    'name' => (string) $field['name'],
                    'type' => is_scalar($field['type'] ?? null) ? (string) $field['type'] : 'string',
                    'value' => $this->normalizeValue($value),
                ];
            })
            ->values()
            ->all();
    }

    private function shippingPriceFromMethod(ShippingMethod $shippingMethod): ?string
    {
        // Business rule: no shipping_price field means free delivery; an empty
        // shipping_price value means the price is negotiated with the customer.
        $priceField = collect($shippingMethod->merchant_settings ?? [])
            ->first(fn ($field) => is_array($field) && ($field['key'] ?? null) === 'shipping_price');

        if (! $priceField) {
            return '0.00';
        }

        $value = $priceField['value'] ?? null;

        if ($value === null || $value === '') {
            return null;
        }

        return is_scalar($value) && is_numeric($value)
            ? number_format((float) $value, 2, '.', '')
            : null;
    }

    private function shippingValuesByKey(array $settings): array
    {
        return collect($settings)
            ->filter(fn ($field) => is_array($field) && is_scalar($field['key'] ?? null))
            ->mapWithKeys(fn (array $field) => [(string) $field['key'] => $field['value'] ?? ''])
            ->all();
    }

    private function normalizeValue($value): array|string
    {
        if (is_array($value)) {
            return array_values(array_map('strval', array_filter($value, 'is_scalar')));
        }

        return is_scalar($value) ? (string) $value : '';
    }

    private function shippingAuditValues(
        string $name,
        string $phone,
        string $note,
        ?string $shippingMethodName,
        array $customerSettings,
    ): array {
        $values = [
            'shipping_method_name' => $shippingMethodName ?? '',
            'shipping_name' => $name,
            'shipping_phone' => $phone,
            'shipping_note' => $note,
        ];

        foreach ($customerSettings as $field) {
            if (! is_array($field) || ! is_scalar($field['key'] ?? null) || ! is_scalar($field['name'] ?? null)) {
                continue;
            }

            $values[$this->shippingAuditFieldKey((string) $field['key'], (string) $field['name'])]
                = $this->shippingAuditValue($field['value'] ?? '');
        }

        return $values;
    }

    private function shippingAuditFieldKey(string $key, string $label): string
    {
        return 'shipping_field:'.$key.':'.$label;
    }

    private function shippingAuditValue($value): string
    {
        if (is_array($value)) {
            return implode(', ', array_values(array_map('strval', array_filter($value, 'is_scalar'))));
        }

        return is_scalar($value) ? (string) $value : '';
    }

    private function recordShippingAudit(Order $order, array $oldValues, array $newValues): void
    {
        $oldChanged = [];
        $newChanged = [];
        $keys = array_unique(array_merge(array_keys($oldValues), array_keys($newValues)));

        foreach ($keys as $key) {
            $oldValue = $oldValues[$key] ?? '';
            $newValue = $newValues[$key] ?? '';

            if ($oldValue === $newValue) {
                continue;
            }

            $oldChanged[$key] = $oldValue;
            $newChanged[$key] = $newValue;
        }

        if ($newChanged === []) {
            return;
        }

        $order->audits()->create([
            'event' => 'updated',
            'message' => 'Изменена информация о доставке',
            'old_values' => $oldChanged,
            'new_values' => $newChanged,
            'user_id' => auth()->id(),
        ]);
    }
}
