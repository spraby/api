<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShippingMethodConstructorRequest;
use App\Models\ShippingMethodConstructor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ShippingMethodConstructorController extends Controller
{
    /**
     * Create a shipping method constructor (admin only).
     */
    public function store(StoreShippingMethodConstructorRequest $request): RedirectResponse
    {
        ShippingMethodConstructor::create($this->payload($request));

        return redirect()->back();
    }

    /**
     * Update a shipping method constructor (admin only).
     */
    public function update(StoreShippingMethodConstructorRequest $request, ShippingMethodConstructor $shippingConstructor): RedirectResponse
    {
        $shippingConstructor->update($this->payload($request));

        return redirect()->back();
    }

    /**
     * Delete a shipping method constructor (admin only).
     * Каскадом удаляются и настроенные брендами shipping_methods.
     */
    public function destroy(Request $request, ShippingMethodConstructor $shippingConstructor): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Only administrators can manage shipping method constructors.');
        }

        $shippingConstructor->delete();

        return redirect()->back();
    }

    /**
     * Json полей собирается на сервере из каталога — клиент присылает только ключи.
     */
    private function payload(StoreShippingMethodConstructorRequest $request): array
    {
        $validated = $request->validated();

        return [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'active' => $validated['active'],
            'position' => $validated['position'],
            'merchant_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::MERCHANT_FIELDS,
                $validated['merchant_fields'],
            ),
            'customer_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::CUSTOMER_FIELDS,
                $validated['customer_fields'],
            ),
        ];
    }
}
