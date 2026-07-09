<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use App\Models\ShippingMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Show the brands list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'description' => $brand->description,
                    'user' => $brand->user ? [
                        'id' => $brand->user->id,
                        'name' => $brand->user->first_name . ' ' . $brand->user->last_name,
                        'email' => $brand->user->email,
                    ] : null,
                    'products_count' => $brand->products()->count(),
                    'created_at' => $brand->created_at->toISOString(),
                ];
            });

        return Inertia::render('Brands', [
            'brands' => $brands,
        ]);
    }

    /**
     * Show the form for creating a new brand.
     */
    public function create(): Response
    {
        $this->authorize('create', Brand::class);

        return Inertia::render('BrandCreate', [
            'brand' => [
                'name' => '',
                'description' => '',
            ],
        ]);
    }

    /**
     * Store a newly created brand.
     */
    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $this->authorize('create', Brand::class);

        try {
            $brand = Brand::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ]);

            return redirect()->route('admin.brands.edit', $brand->id)
                ->with('success', 'Brand created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create brand: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand): Response
    {
        $this->authorize('view', Brand::class);

        $brand->load(['user', 'shippingMethods.methodConstructor']);

        return Inertia::render('BrandEdit', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->description,
                'user_id' => $brand->user_id,
                'user' => $brand->user ? [
                    'id' => $brand->user->id,
                    'name' => $brand->user->first_name . ' ' . $brand->user->last_name,
                    'email' => $brand->user->email,
                ] : null,
                'category_ids' => $brand->categories()->pluck('categories.id')->toArray(),
                // Read-only: способы доставки настраивает менеджер в «Настройки → Доставка»
                'shipping_methods' => $brand->shippingMethods
                    ->map(fn (ShippingMethod $method) => [
                        'id' => $method->id,
                        'name' => $method->methodConstructor?->name ?? '—',
                    ])
                    ->values(),
                'created_at' => $brand->created_at->toISOString(),
                'updated_at' => $brand->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Update the specified brand.
     */
    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $this->authorize('update', Brand::class);

        try {
            $brand->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ]);

            $brand->categories()->sync($request->input('category_ids', []));

            return Redirect::route('admin.brands.edit', $brand->id)
                ->with('success', 'Brand updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update brand: ' . $e->getMessage());
        }
    }

    /**
     * Delete the specified brand.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        $this->authorize('delete', Brand::class);

        try {
            $brand->delete();

            return Redirect::route('admin.brands')->with('success', 'Brand deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete brand: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete brands.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Brand::class);

        $request->validate([
            'brand_ids' => 'required|array',
            'brand_ids.*' => 'required|integer|exists:brands,id',
        ]);

        try {
            // Поштучно, а не query-delete: иначе не сработает deleting-hook,
            // зачищающий shipping_methods бренда.
            DB::transaction(function () use ($request) {
                Brand::whereIn('id', $request->input('brand_ids'))->get()->each->delete();
            });

            return Redirect::route('admin.brands')->with('success', 'Brands deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete brands: ' . $e->getMessage());
        }
    }

    /**
     * Sync categories for the brand.
     */
    public function syncCategories(Request $request, Brand $brand): RedirectResponse
    {
        $this->authorize('update', Brand::class);

        $validated = $request->validate([
            'category_ids' => ['present', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ]);

        $brand->categories()->sync($validated['category_ids']);

        return Redirect::back()->with('success', 'Categories updated successfully');
    }

}
