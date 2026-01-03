<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Get paginated list of products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['brand:id,name', 'category:id,name'])
            ->withCount(['variants', 'images', 'orderItems as orders_count']);

        // Apply Row Level Security for non-admin users
        if (! Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if ($userBrand) {
                $query->where('brand_id', $userBrand->id);
            } else {
                // User has no brand - return empty result
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                ]);
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Status filter (enabled)
        if ($request->filled('enabled')) {
            $enabled = filter_var($request->enabled, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($enabled !== null) {
                $query->where('enabled', $enabled);
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort field
        $allowedSortFields = [
            'id', 'title', 'price', 'final_price', 'created_at', 'updated_at',
            'variants_count', 'images_count', 'orders_count',
        ];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginate
        $perPage = min($request->get('per_page', 20), 100);

        $result = $query->paginate($perPage);

        // Add computed attributes to each product
        $result->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'title' => $product->title,
                'description' => $product->description,
                'enabled' => $product->enabled,
                'price' => (string) $product->price,
                'final_price' => (string) $product->final_price,
                'discount' => $product->discount,
                'created_at' => $product->created_at?->toISOString(),
                'updated_at' => $product->updated_at?->toISOString(),
                'brand' => $product->brand,
                'category' => $product->category,
                'variants_count' => $product->variants_count,
                'images_count' => $product->images_count,
                'orders_count' => $product->orders_count,
            ];
        });

        return response()->json($result);
    }

    /**
     * Get a single product
     */
    public function show(Product $product): JsonResponse
    {
        // Check access for non-admin users
        if (! Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if (! $userBrand || $product->brand_id !== $userBrand->id) {
                abort(403, 'Access denied');
            }
        }

        $product->load(['brand:id,name', 'category:id,name'])
            ->loadCount(['variants', 'images', 'orderItems as orders_count']);

        return response()->json([
            'id' => $product->id,
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'title' => $product->title,
            'description' => $product->description,
            'enabled' => $product->enabled,
            'price' => (string) $product->price,
            'final_price' => (string) $product->final_price,
            'discount' => $product->discount,
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
            'brand' => $product->brand,
            'category' => $product->category,
            'variants_count' => $product->variants_count,
            'images_count' => $product->images_count,
            'orders_count' => $product->orders_count,
        ]);
    }

    /**
     * Create a new product
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'enabled' => 'boolean',
        ]);

        // brand_id will be set automatically by Product model observer
        $product = Product::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'price' => $validated['price'],
            'final_price' => $validated['final_price'],
            'enabled' => $validated['enabled'] ?? true,
        ]);

        $product->load(['brand:id,name', 'category:id,name'])
            ->loadCount(['variants', 'images', 'orderItems as orders_count']);

        return response()->json([
            'id' => $product->id,
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'title' => $product->title,
            'description' => $product->description,
            'enabled' => $product->enabled,
            'price' => (string) $product->price,
            'final_price' => (string) $product->final_price,
            'discount' => $product->discount,
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
            'brand' => $product->brand,
            'category' => $product->category,
            'variants_count' => $product->variants_count,
            'images_count' => $product->images_count,
            'orders_count' => $product->orders_count,
        ], 201);
    }

    /**
     * Update a product
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        // Check access for non-admin users
        if (! Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if (! $userBrand || $product->brand_id !== $userBrand->id) {
                abort(403, 'Access denied');
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'enabled' => 'boolean',
        ]);

        $product->update($validated);

        $product->load(['brand:id,name', 'category:id,name'])
            ->loadCount(['variants', 'images', 'orderItems as orders_count']);

        return response()->json([
            'id' => $product->id,
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'title' => $product->title,
            'description' => $product->description,
            'enabled' => $product->enabled,
            'price' => (string) $product->price,
            'final_price' => (string) $product->final_price,
            'discount' => $product->discount,
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
            'brand' => $product->brand,
            'category' => $product->category,
            'variants_count' => $product->variants_count,
            'images_count' => $product->images_count,
            'orders_count' => $product->orders_count,
        ]);
    }

    /**
     * Delete a product
     */
    public function destroy(Product $product): JsonResponse
    {
        // Check access for non-admin users
        if (! Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if (! $userBrand || $product->brand_id !== $userBrand->id) {
                abort(403, 'Access denied');
            }
        }

        // Check if product has orders
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Cannot delete product with existing orders',
            ], 422);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
