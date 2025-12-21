<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Get simple list of categories for dropdowns
     */
    public function index(): JsonResponse
    {
        $query = Category::query()
            ->select('id', 'name')
            ->orderBy('name');

        // Apply Row Level Security for non-admin users
        if (!Auth::user()?->hasRole('admin')) {
            $userBrand = Auth::user()->brands()->first();
            if ($userBrand) {
                $query->where('brand_id', $userBrand->id);
            } else {
                return response()->json(['data' => []]);
            }
        }

        $categories = $query->get();

        return response()->json(['data' => $categories]);
    }
}
