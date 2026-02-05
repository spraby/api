<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
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

        return Inertia::render('Settings', [
            'addresses' => $addresses,
        ]);
    }

    /**
     * Create a new address for the brand.
     */
    public function storeAddress(StoreAddressRequest $request): RedirectResponse
    {
        $brand = auth()->user()->getBrand();

        if (!$brand) {
            return redirect()->back()->withErrors(['brand' => 'No brand found.']);
        }

        $brand->addresses()->create($request->validated());

        return redirect()->back();
    }

    /**
     * Update an address for the brand.
     */
    public function updateAddress(StoreAddressRequest $request, int $id): RedirectResponse
    {
        $brand = auth()->user()->getBrand();

        if (!$brand) {
            return redirect()->back()->withErrors(['brand' => 'No brand found.']);
        }

        $address = Address::where('id', $id)
            ->where('addressable_type', 'App\Models\Brand')
            ->where('addressable_id', $brand->id)
            ->firstOrFail();

        $address->update($request->validated());

        return redirect()->back();
    }

    /**
     * Delete an address for the brand.
     */
    public function destroyAddress(int $id): RedirectResponse
    {
        $brand = auth()->user()->getBrand();

        if (!$brand) {
            return redirect()->back()->withErrors(['brand' => 'No brand found.']);
        }

        $address = Address::where('id', $id)
            ->where('addressable_type', 'App\Models\Brand')
            ->where('addressable_id', $brand->id)
            ->firstOrFail();

        $address->delete();

        return redirect()->back();
    }
}
