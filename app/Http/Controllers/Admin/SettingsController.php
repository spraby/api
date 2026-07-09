<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateContactsRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Contact;
use App\Models\Settings;
use App\Models\ShippingMethod;
use App\Models\ShippingMethodConstructor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Get authenticated user's brand or return error redirect.
     */
    private function getRequiredBrand(): Brand|RedirectResponse
    {
        $brand = auth()->user()->getBrand();

        if (!$brand) {
            return redirect()->back()->withErrors(['brand' => 'No brand found.']);
        }

        return $brand;
    }

    /**
     * Find address belonging to the brand.
     */
    private function findBrandAddress(Brand $brand, int $id): Address
    {
        return Address::where('id', $id)
            ->where('addressable_type', Brand::class)
            ->where('addressable_id', $brand->id)
            ->firstOrFail();
    }

    /**
     * Show Settings page with addresses.
     */
    public function index(): Response
    {
        $brand = auth()->user()->getBrand();

        $addresses = $brand
            ? $brand->addresses()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($address) => [
                    'id' => $address->id,
                    'name' => $address->name,
                    'country' => $address->country,
                    'province' => $address->province,
                    'city' => $address->city,
                    'zip_code' => $address->zip_code,
                    'address1' => $address->address1,
                    'address2' => $address->address2,
                    'created_at' => $address->created_at->toISOString(),
                ])
            : [];

        $contacts = [];
        if ($brand) {
            foreach ($brand->contacts as $contact) {
                $contacts[$contact->type] = $contact->value;
            }
        }

        $isAdmin = auth()->user()->isAdmin();

        // Данные вкладки «Доставка» менеджера — админу они не рендерятся
        $shippingConstructors = [];
        $brandShippingMethods = [];
        if (! $isAdmin) {
            $shippingConstructors = ShippingMethodConstructor::query()
                ->where('active', true)
                ->orderBy('position')
                ->get()
                ->map(fn (ShippingMethodConstructor $constructor) => [
                    'id' => $constructor->id,
                    'name' => $constructor->name,
                    'description' => $constructor->description,
                    'merchant_fields' => $constructor->merchant_settings['fields'] ?? [],
                ])
                ->values()
                ->all();

            $brandShippingMethods = $brand
                ? $brand->shippingMethods()
                    ->get()
                    ->map(fn (ShippingMethod $method) => [
                        'id' => $method->id,
                        'constructor_id' => $method->shipping_method_constructor_id,
                        'merchant_settings' => $method->merchant_settings,
                    ])
                    ->values()
                    ->all()
                : [];
        }

        $adminData = [];
        if ($isAdmin) {
            $adminData = [
                'allShippingConstructors' => ShippingMethodConstructor::query()
                    ->orderBy('position')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (ShippingMethodConstructor $constructor) => [
                        'id' => $constructor->id,
                        'name' => $constructor->name,
                        'description' => $constructor->description,
                        'active' => $constructor->active,
                        'position' => $constructor->position,
                        'merchant_fields' => array_column($constructor->merchant_settings['fields'] ?? [], 'key'),
                        'customer_fields' => array_column($constructor->customer_settings['fields'] ?? [], 'key'),
                    ])
                    ->values()
                    ->all(),
                'merchantFieldsCatalog' => ShippingMethodConstructor::catalogList(ShippingMethodConstructor::MERCHANT_FIELDS),
                'customerFieldsCatalog' => ShippingMethodConstructor::catalogList(ShippingMethodConstructor::CUSTOMER_FIELDS),
                'menu' => Settings::menu()->first()?->data ?? [],
                'menuMaxDepth' => UpdateMenuRequest::MAX_DEPTH,
                'menuCollections' => Collection::query()
                    ->orderBy('title')
                    ->get(['id', 'name', 'title', 'handle'])
                    ->map(fn ($c) => [
                        'id' => (int) $c->id,
                        'name' => $c->name,
                        'title' => $c->title,
                        'url' => '/collections/'.$c->handle,
                    ])
                    ->all(),
                'menuCategories' => Category::query()
                    ->orderBy('title')
                    ->get(['id', 'name', 'title', 'handle'])
                    ->map(fn ($c) => [
                        'id' => (int) $c->id,
                        'name' => $c->name,
                        'title' => $c->title,
                        'url' => '/categories/'.$c->handle,
                    ])
                    ->all(),
            ];
        }

        return Inertia::render('Settings', [
            'addresses' => $addresses,
            'contacts' => $contacts,
            'shippingConstructors' => $shippingConstructors,
            'brandShippingMethods' => $brandShippingMethods,
            'about' => $brand?->about ?? '',
            'refundPolicy' => $brand?->refund_policy ?? '',
            ...$adminData,
        ]);
    }

    /**
     * Update the global navigation menu (admin only).
     */
    public function updateMenu(UpdateMenuRequest $request): RedirectResponse
    {
        $menu = $request->validated()['menu'];
        $used = $this->collectUsedIds($menu);
        $normalized = $this->normalizeMenuNodes($menu, $used);

        $existing = Settings::menu()->first();
        if ($existing) {
            $existing->update(['data' => $normalized]);
        } else {
            Settings::createMenu($normalized);
        }

        return redirect()->back();
    }

    /**
     * Collect all integer ids already present in the tree so new nodes don't collide.
     */
    private function collectUsedIds(array $nodes, array &$used = []): array
    {
        foreach ($nodes as $node) {
            if (isset($node['id']) && is_int($node['id'])) {
                $used[$node['id']] = true;
            }
            if (!empty($node['children']) && is_array($node['children'])) {
                $this->collectUsedIds($node['children'], $used);
            }
        }

        return $used;
    }

    /**
     * Normalize nodes: keep numeric ids, assign new ids for nodes that lack them,
     * strip unknown fields, trim strings.
     */
    private function normalizeMenuNodes(array $nodes, array &$used): array
    {
        $result = [];

        foreach ($nodes as $node) {
            $id = isset($node['id']) && is_int($node['id']) ? $node['id'] : $this->nextId($used);
            $used[$id] = true;

            $normalized = [
                'id' => $id,
                'title' => trim((string) ($node['title'] ?? '')),
                'url' => trim((string) ($node['url'] ?? '')),
            ];

            if (isset($node['ref_type']) && in_array($node['ref_type'], ['collection', 'category', 'custom'], true)) {
                $normalized['ref_type'] = $node['ref_type'];
            }
            if (isset($node['ref_id']) && (is_int($node['ref_id']) || (is_string($node['ref_id']) && ctype_digit($node['ref_id'])))) {
                $normalized['ref_id'] = (int) $node['ref_id'];
            }

            if (!empty($node['children']) && is_array($node['children'])) {
                $normalized['children'] = $this->normalizeMenuNodes($node['children'], $used);
            }

            $result[] = $normalized;
        }

        return $result;
    }

    private function nextId(array &$used): int
    {
        $next = empty($used) ? 1 : (max(array_keys($used)) + 1);
        $used[$next] = true;

        return $next;
    }

    /**
     * Create a new address for the brand.
     */
    public function storeAddress(StoreAddressRequest $request): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $brand->addresses()->create($request->validated());

        return redirect()->back();
    }

    /**
     * Update an address for the brand.
     */
    public function updateAddress(StoreAddressRequest $request, int $id): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $this->findBrandAddress($brand, $id)->update($request->validated());

        return redirect()->back();
    }

    /**
     * Sync contacts for the brand.
     */
    public function updateContacts(UpdateContactsRequest $request): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $existingContacts = $brand->contacts->keyBy('type');

        foreach (Contact::TYPES as $type) {
            $value = $request->validated()[$type] ?? null;
            $existing = $existingContacts->get($type);

            if ($value) {
                if ($existing) {
                    $existing->update(['value' => $value]);
                } else {
                    $brand->contacts()->create(['type' => $type, 'value' => $value]);
                }
            } elseif ($existing) {
                $existing->delete();
            }
        }

        return redirect()->back();
    }

    /**
     * Sync shipping methods for the brand.
     *
     * Payload: methods: [{constructor_id, enabled, values: {key: value}}, ...].
     * Включение создаёт запись shipping_methods (снапшот полей конструктора + значения),
     * выключение — удаляет её. Для существующих записей выполняется re-snapshot:
     * json пересобирается по текущим полям конструктора с переносом значений по key.
     */
    public function syncShippingMethods(Request $request): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $validated = $request->validate([
            'methods' => ['present', 'array'],
            'methods.*.constructor_id' => ['required', 'integer', 'exists:shipping_method_constructors,id'],
            'methods.*.enabled' => ['required', 'boolean'],
            'methods.*.values' => ['present', 'array'],
        ]);

        $constructors = ShippingMethodConstructor::query()
            ->whereIn('id', array_column($validated['methods'], 'constructor_id'))
            ->get()
            ->keyBy('id');

        DB::transaction(function () use ($brand, $validated, $constructors) {
            // На (brand, constructor) нет уникального индекса — связь через пивот.
            // Блокировка строки бренда сериализует конкурентные сохранения вкладки,
            // иначе двойной submit создаст дубль способа доставки.
            Brand::query()->whereKey($brand->id)->lockForUpdate()->first();

            $existingMethods = $brand->shippingMethods()
                ->get()
                ->keyBy('shipping_method_constructor_id');

            foreach ($validated['methods'] as $item) {
                $constructor = $constructors->get($item['constructor_id']);

                // Записи по неактивным конструкторам не трогаем.
                if (! $constructor || ! $constructor->active) {
                    continue;
                }

                $existing = $existingMethods->get($constructor->id);

                if (! $item['enabled']) {
                    // Пивот brand_shipping_method чистится каскадом по FK
                    $existing?->delete();

                    continue;
                }

                $values = $this->normalizeMerchantValues($constructor, $item['values']);

                if ($existing) {
                    // Ключи, не пришедшие в payload, переносим из текущей записи.
                    foreach ($existing->merchant_settings ?? [] as $field) {
                        if (isset($field['key']) && ! array_key_exists($field['key'], $values)) {
                            $values[$field['key']] = $field['value'] ?? null;
                        }
                    }
                }

                $attributes = [
                    'shipping_method_constructor_id' => $constructor->id,
                    'merchant_settings' => ShippingMethodConstructor::settingsWithValues(
                        $constructor->merchant_settings['fields'] ?? [],
                        $values,
                    ),
                    'customer_settings' => ShippingMethodConstructor::settingsWithValues(
                        $constructor->customer_settings['fields'] ?? [],
                        [],
                    ),
                ];

                if ($existing) {
                    $existing->update($attributes);
                } else {
                    $method = ShippingMethod::create($attributes);
                    $brand->shippingMethods()->attach($method->id);
                }
            }
        });

        return redirect()->back();
    }

    private const MERCHANT_VALUE_MAX_LENGTH = 1000;

    private const MERCHANT_SELECT_MAX_ITEMS = 100;

    /**
     * Привести значения полей продавца к типам каталога:
     * select — массив непустых строк, number — числовая строка, остальное — строка.
     * Значения снапшотятся в JSONB как есть, поэтому размер и тип проверяем здесь.
     */
    private function normalizeMerchantValues(ShippingMethodConstructor $constructor, array $raw): array
    {
        $values = [];

        foreach ($constructor->merchant_settings['fields'] ?? [] as $field) {
            if (! array_key_exists($field['key'], $raw)) {
                continue;
            }

            $value = $raw[$field['key']];
            $type = $field['type'] ?? 'string';

            if ($type === 'select') {
                $items = array_filter(is_array($value) ? $value : [], 'is_scalar');
                $items = array_values(array_filter(
                    array_map(fn ($item) => trim((string) $item), $items),
                    fn (string $item) => $item !== '',
                ));

                if (count($items) > self::MERCHANT_SELECT_MAX_ITEMS) {
                    $this->failMerchantValue($field, __('admin.settings_delivery.errors.too_many_items'));
                }

                foreach ($items as $item) {
                    $this->assertMerchantValueLength($field, $item);
                }

                $values[$field['key']] = $items;

                continue;
            }

            $string = is_scalar($value) ? trim((string) $value) : '';
            $this->assertMerchantValueLength($field, $string);

            if ($type === 'number' && $string !== '' && ! is_numeric($string)) {
                $this->failMerchantValue($field, __('admin.settings_delivery.errors.not_a_number'));
            }

            $values[$field['key']] = $string;
        }

        return $values;
    }

    private function assertMerchantValueLength(array $field, string $value): void
    {
        if (mb_strlen($value) > self::MERCHANT_VALUE_MAX_LENGTH) {
            $this->failMerchantValue($field, __('admin.settings_delivery.errors.too_long'));
        }
    }

    private function failMerchantValue(array $field, string $message): never
    {
        throw ValidationException::withMessages([
            'methods' => sprintf('%s: %s', $field['name'] ?? $field['key'], $message),
        ]);
    }

    /**
     * Update general brand info (about, refund policy).
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $validated = $request->validate([
            'about' => ['nullable', 'string'],
            'refund_policy' => ['nullable', 'string'],
        ]);

        $brand->update($validated);

        return redirect()->back();
    }

    /**
     * Delete an address for the brand.
     */
    public function destroyAddress(int $id): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $this->findBrandAddress($brand, $id)->delete();

        return redirect()->back();
    }
}
