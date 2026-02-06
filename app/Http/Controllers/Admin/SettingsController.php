<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateContactsRequest;
use App\Models\Address;
use App\Models\Brand;
use App\Models\Contact;
use App\Models\ShippingMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $shippingMethods = $brand
            ? $brand->shippingMethods()->orderBy('name')->get()->map->toSelectArray()
            : [];

        $allShippingMethods = ShippingMethod::orderBy('name')->get()->map->toSelectArray();

        return Inertia::render('Settings', [
            'addresses' => $addresses,
            'contacts' => $contacts,
            'shippingMethods' => $shippingMethods,
            'allShippingMethods' => $allShippingMethods,
        ]);
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
     */
    public function syncShippingMethods(Request $request): RedirectResponse
    {
        $brand = $this->getRequiredBrand();
        if ($brand instanceof RedirectResponse) {
            return $brand;
        }

        $validated = $request->validate([
            'shipping_method_ids' => ['present', 'array'],
            'shipping_method_ids.*' => ['integer', 'exists:shipping_methods,id'],
        ]);

        $brand->shippingMethods()->sync($validated['shipping_method_ids']);

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
