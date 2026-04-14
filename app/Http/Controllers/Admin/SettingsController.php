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

        $adminData = [];
        if (auth()->user()->isAdmin()) {
            $adminData = [
                'menu' => Settings::menu()->first()?->data ?? [],
                'menuMaxDepth' => UpdateMenuRequest::MAX_DEPTH,
                'menuCollections' => Collection::query()
                    ->orderBy('title')
                    ->get(['id', 'title', 'handle'])
                    ->map(fn ($c) => [
                        'id' => (int) $c->id,
                        'title' => $c->title,
                        'url' => '/collections/'.$c->handle,
                    ])
                    ->all(),
                'menuCategories' => Category::query()
                    ->orderBy('title')
                    ->get(['id', 'title', 'handle'])
                    ->map(fn ($c) => [
                        'id' => (int) $c->id,
                        'title' => $c->title,
                        'url' => '/categories/'.$c->handle,
                    ])
                    ->all(),
            ];
        }

        return Inertia::render('Settings', [
            'addresses' => $addresses,
            'contacts' => $contacts,
            'shippingMethods' => $shippingMethods,
            'allShippingMethods' => $allShippingMethods,
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
