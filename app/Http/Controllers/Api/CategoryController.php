<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Get simple list of categories for dropdowns
     * Optionally filtered by brand_id
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()
            ->select('id', 'name')
            ->orderBy('name');

        // Filter by brand_id if provided
        $brandId = $request->input('brand_id');
        if ($brandId) {
            $query->whereHas('brands', function ($q) use ($brandId) {
                $q->where('brands.id', $brandId);
            });
        }

        // Apply Row Level Security for non-admin users
        if (! Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if ($userBrand) {
                $query->whereHas('brands', function ($q) use ($userBrand) {
                    $q->where('brands.id', $userBrand->id);
                });
            } else {
                return response()->json(['data' => []]);
            }
        }

        $categories = $query->get();

        return response()->json(['data' => $categories]);
    }
}
