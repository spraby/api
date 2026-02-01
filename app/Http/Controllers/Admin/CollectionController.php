<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCollectionRequest;
use App\Http\Requests\UpdateCollectionRequest;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    /**
     * Show the collections list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Collection::class);

        $collections = Collection::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($collection) {
                return [
                    'id' => $collection->id,
                    'handle' => $collection->handle,
                    'name' => $collection->name,
                    'title' => $collection->title,
                    'header' => $collection->header,
                    'description' => $collection->description,
                    'categories_count' => $collection->categories()->count(),
                    'created_at' => $collection->created_at->toISOString(),
                ];
            });

        return Inertia::render('Collections', [
            'collections' => $collections,
        ]);
    }

    /**
     * Show the form for creating a new collection.
     */
    public function create(): Response
    {
        $this->authorize('create', Collection::class);

        return Inertia::render('CollectionCreate', [
            'collection' => [
                'handle' => '',
                'name' => '',
                'title' => '',
                'header' => '',
                'description' => '',
            ],
        ]);
    }

    /**
     * Store a newly created collection.
     */
    public function store(StoreCollectionRequest $request): RedirectResponse
    {
        $this->authorize('create', Collection::class);

        try {
            $handle = $request->input('handle');
            if (empty($handle)) {
                $handle = Str::slug($request->input('name'));
            }

            $collection = Collection::create([
                'handle' => $handle,
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'header' => $request->input('header'),
                'description' => $request->input('description'),
            ]);

            return redirect()->route('admin.collections.edit', $collection->id)
                ->with('success', 'Collection created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create collection: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified collection.
     */
    public function edit(Collection $collection): Response
    {
        $this->authorize('view', Collection::class);

        return Inertia::render('CollectionEdit', [
            'collection' => [
                'id' => $collection->id,
                'handle' => $collection->handle,
                'name' => $collection->name,
                'title' => $collection->title,
                'header' => $collection->header,
                'description' => $collection->description,
                'created_at' => $collection->created_at->toISOString(),
                'updated_at' => $collection->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Update the specified collection.
     */
    public function update(UpdateCollectionRequest $request, Collection $collection): RedirectResponse
    {
        $this->authorize('update', Collection::class);

        try {
            $handle = $request->input('handle');
            if (empty($handle)) {
                $handle = Str::slug($request->input('name'));
            }

            $collection->update([
                'handle' => $handle,
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'header' => $request->input('header'),
                'description' => $request->input('description'),
            ]);

            return Redirect::route('admin.collections.edit', $collection->id)
                ->with('success', 'Collection updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update collection: ' . $e->getMessage());
        }
    }

    /**
     * Delete the specified collection.
     */
    public function destroy(Collection $collection): RedirectResponse
    {
        $this->authorize('delete', Collection::class);

        try {
            $collection->delete();

            return Redirect::route('admin.collections')->with('success', 'Collection deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete collection: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete collections.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Collection::class);

        $request->validate([
            'collection_ids' => 'required|array',
            'collection_ids.*' => 'required|integer|exists:collections,id',
        ]);

        try {
            Collection::whereIn('id', $request->input('collection_ids'))->delete();

            return Redirect::route('admin.collections')->with('success', 'Collections deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete collections: ' . $e->getMessage());
        }
    }
}