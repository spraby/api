<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Show the products list page.
     * Data is fetched via API using TanStack Query
     */
    public function index(): Response
    {
        return Inertia::render('Products');
    }

    /**
     * Show the form for editing the specified product.
     * Data is fetched via API using TanStack Query
     */
    public function edit(int $id): Response
    {
        return Inertia::render('ProductEdit', [
            'productId' => $id,
        ]);
    }

    // ========================================
    // API ENDPOINTS (для TanStack Query)
    // ========================================

    /**
     * API: Get all products as JSON
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'images.image'])
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $categoryId = $request->input('category_id');
            $query->where('category_id', $categoryId);
        }

        if ($request->has('enabled')) {
            $enabled = $request->input('enabled');
            if ($enabled === 'true' || $enabled === '1') {
                $query->where('enabled', true);
            } elseif ($enabled === 'false' || $enabled === '0') {
                $query->where('enabled', false);
            }
        }

        $products = $query->get()->map(function ($product) {
            $mainImage = $product->images->sortBy('position')->first();

            return [
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => (string) $product->price,
                'final_price' => (string) $product->final_price,
                'enabled' => $product->enabled,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'image_url' => $mainImage?->image?->url,
                'created_at' => $product->created_at->toISOString(),
            ];
        });

        return response()->json($products);
    }

    /**
     * API: Get single product as JSON
     */
    public function apiShow(int $id): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images.image', 'variants'])->findOrFail($id);
        $mainImage = $product->images->sortBy('position')->first();

        return response()->json([
            'id' => $product->id,
            'title' => $product->title,
            'description' => $product->description,
            'price' => (string) $product->price,
            'final_price' => (string) $product->final_price,
            'enabled' => $product->enabled,
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
            ] : null,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'image_url' => $mainImage?->image?->url,
            'images' => $product->images->sortBy('position')->map(function ($productImage) {
                return [
                    'id' => $productImage->id,
                    'image_id' => $productImage->image_id,
                    'url' => $productImage->image?->url,
                    'position' => $productImage->position,
                ];
            })->values(),
            'variants' => $product->variants->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'title' => $variant->title,
                    'price' => (string) $variant->price,
                    'final_price' => (string) $variant->final_price,
                    'enabled' => $variant->enabled,
                ];
            }),
            'created_at' => $product->created_at->toISOString(),
        ]);
    }

    /**
     * API: Update product and return JSON
     */
    public function apiUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'enabled' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.title' => 'nullable|string|max:255',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.final_price' => 'required|numeric|min:0',
            'variants.*.enabled' => 'required|boolean',
        ]);

        try {
            $product = Product::findOrFail($id);

            // Update product
            $product->update([
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'final_price' => $request->input('final_price'),
                'enabled' => $request->input('enabled'),
                'category_id' => $request->input('category_id'),
            ]);

            // Get existing variant IDs
            $existingVariantIds = $product->variants->pluck('id')->toArray();
            $submittedVariantIds = [];

            // Update or create variants
            foreach ($request->input('variants') as $variantData) {
                if (isset($variantData['id']) && in_array($variantData['id'], $existingVariantIds)) {
                    // Update existing variant
                    $variant = Variant::find($variantData['id']);
                    $variant->update([
                        'title' => $variantData['title'] ?? null,
                        'price' => $variantData['price'],
                        'final_price' => $variantData['final_price'],
                        'enabled' => $variantData['enabled'],
                    ]);
                    $submittedVariantIds[] = $variantData['id'];
                } else {
                    // Create new variant
                    $variant = $product->variants()->create([
                        'title' => $variantData['title'] ?? null,
                        'price' => $variantData['price'],
                        'final_price' => $variantData['final_price'],
                        'enabled' => $variantData['enabled'],
                    ]);
                    $submittedVariantIds[] = $variant->id;
                }
            }

            // Delete variants that were removed
            $variantsToDelete = array_diff($existingVariantIds, $submittedVariantIds);
            if (! empty($variantsToDelete)) {
                Variant::whereIn('id', $variantsToDelete)->delete();
            }

            // Reload product with relationships
            $product->load(['brand', 'category', 'images.image', 'variants']);

            $mainImage = $product->images->sortBy('position')->first();

            return response()->json([
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => (string) $product->price,
                'final_price' => (string) $product->final_price,
                'enabled' => $product->enabled,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'image_url' => $mainImage?->image?->url,
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
                'variants' => $product->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'title' => $variant->title,
                        'price' => (string) $variant->price,
                        'final_price' => (string) $variant->final_price,
                        'enabled' => $variant->enabled,
                    ];
                }),
                'created_at' => $product->created_at->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Delete product and return JSON
     */
    public function apiDestroy(int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Bulk delete products and return JSON
     */
    public function apiBulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
        ]);

        $productIds = $request->input('product_ids');

        Product::whereIn('id', $productIds)->delete();

        return response()->json([
            'message' => 'Products deleted successfully',
        ]);
    }

    /**
     * API: Bulk update product status (enabled/disabled)
     */
    public function apiBulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
            'enabled' => 'required|boolean',
        ]);

        $productIds = $request->input('product_ids');
        $enabled = $request->input('enabled');

        Product::whereIn('id', $productIds)->update(['enabled' => $enabled]);

        return response()->json([
            'message' => 'Product status updated successfully',
        ]);
    }
}
