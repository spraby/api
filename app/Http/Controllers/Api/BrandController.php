<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class BrandController extends Controller
{
    /**
     * Get paginated list of brands
     */
    public function index(Request $request): JsonResponse
    {
        $query = Brand::query()
            ->withCount(['products', 'categories', 'orders']);

        // Apply Row Level Security for non-admin users
        if (!Auth::user()?->hasRole('admin')) {
            $userBrandIds = Auth::user()->brands()->pluck('brands.id');
            $query->whereIn('id', $userBrandIds);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort field
        $allowedSortFields = ['id', 'name', 'created_at', 'updated_at', 'products_count', 'orders_count'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginate
        $perPage = min($request->get('per_page', 10), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Get a single brand
     */
    public function show(Brand $brand): JsonResponse
    {
        // Check access for non-admin users
        if (!Auth::user()?->hasRole('admin')) {
            $userBrandIds = Auth::user()->brands()->pluck('brands.id')->toArray();
            if (!in_array($brand->id, $userBrandIds)) {
                abort(403, 'Access denied');
            }
        }

        $brand->loadCount(['products', 'categories', 'orders']);

        return response()->json($brand);
    }

    /**
     * Create a new brand
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'description' => 'nullable|string|max:1000',
        ]);

        $brand = Brand::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'user_id' => Auth::id(),
        ]);

        return response()->json($brand, 201);
    }

    /**
     * Update a brand
     */
    public function update(Request $request, Brand $brand): JsonResponse
    {
        // Check access for non-admin users
        if (!Auth::user()?->hasRole('admin')) {
            $userBrandIds = Auth::user()->brands()->pluck('brands.id')->toArray();
            if (!in_array($brand->id, $userBrandIds)) {
                abort(403, 'Access denied');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $brand->update($validated);

        return response()->json($brand);
    }

    /**
     * Delete a brand
     */
    public function destroy(Brand $brand): JsonResponse
    {
        // Only admin can delete brands
        if (!Auth::user()?->hasRole('admin')) {
            abort(403, 'Only administrators can delete brands');
        }

        // Check if brand has related data
        if ($brand->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete brand with existing products'
            ], 422);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted successfully']);
    }
}
