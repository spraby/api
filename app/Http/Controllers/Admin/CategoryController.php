<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Show the categories list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'handle' => $category->handle,
                    'name' => $category->name,
                    'title' => $category->title,
                    'header' => $category->header,
                    'description' => $category->description,
                    'products_count' => $category->products()->count(),
                    'created_at' => $category->created_at->toISOString(),
                ];
            });

        return Inertia::render('Categories', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        $this->authorize('create', Category::class);

        return Inertia::render('CategoryCreate', [
            'category' => [
                'handle' => '',
                'name' => '',
                'title' => '',
                'header' => '',
                'description' => '',
            ],
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', Category::class);

        try {
            $handle = $request->input('handle');
            if (empty($handle)) {
                $handle = Str::slug($request->input('name'));
            }

            $category = Category::create([
                'handle' => $handle,
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'header' => $request->input('header'),
                'description' => $request->input('description'),
            ]);

            return redirect()->route('admin.categories.edit', $category->id)
                ->with('success', 'Category created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create category: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category): Response
    {
        $this->authorize('view', Category::class);

        return Inertia::render('CategoryEdit', [
            'category' => [
                'id' => $category->id,
                'handle' => $category->handle,
                'name' => $category->name,
                'title' => $category->title,
                'header' => $category->header,
                'description' => $category->description,
                'created_at' => $category->created_at->toISOString(),
                'updated_at' => $category->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->authorize('update', Category::class);

        try {
            $handle = $request->input('handle');
            if (empty($handle)) {
                $handle = Str::slug($request->input('name'));
            }

            $category->update([
                'handle' => $handle,
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'header' => $request->input('header'),
                'description' => $request->input('description'),
            ]);

            return Redirect::route('admin.categories.edit', $category->id)
                ->with('success', 'Category updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update category: ' . $e->getMessage());
        }
    }

    /**
     * Delete the specified category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', Category::class);

        try {
            $category->delete();

            return Redirect::route('admin.categories')->with('success', 'Category deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete category: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete categories.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Category::class);

        $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'required|integer|exists:categories,id',
        ]);

        try {
            Category::whereIn('id', $request->input('category_ids'))->delete();

            return Redirect::route('admin.categories')->with('success', 'Categories deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete categories: ' . $e->getMessage());
        }
    }
}
