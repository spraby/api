<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequestRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CategoryRequest;
use App\Models\CategoryRequestItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MyCategoriesController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        /** @var Brand|null $brand */
        $brand = $user->getBrand();

        if (! $brand) {
            return Inertia::render('MyCategories', [
                'categories' => [],
                'attachedIds' => [],
                'pendingIds' => [],
                'requests' => [],
                'error' => __('admin.category_requests.errors.no_brand'),
            ]);
        }

        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'handle'])
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'handle' => $c->handle,
            ]);

        $attachedIds = $brand->categories()->pluck('categories.id')->all();

        $pendingIds = CategoryRequestItem::query()
            ->where('status', CategoryRequestItem::STATUS_PENDING)
            ->whereHas('request', function ($query) use ($brand) {
                $query->where('brand_id', $brand->id)
                    ->where('status', CategoryRequest::STATUS_PENDING);
            })
            ->pluck('category_id')
            ->all();

        $requests = CategoryRequest::with(['items.category'])
            ->where('brand_id', $brand->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CategoryRequest $r) => [
                'id' => $r->id,
                'status' => $r->status,
                'created_at' => $r->created_at->toISOString(),
                'reviewed_at' => $r->reviewed_at?->toISOString(),
                'items' => $r->items->map(fn (CategoryRequestItem $i) => [
                    'id' => $i->id,
                    'status' => $i->status,
                    'rejection_reason' => $i->rejection_reason,
                    'category' => $i->category ? [
                        'id' => $i->category->id,
                        'name' => $i->category->name,
                    ] : null,
                ])->values(),
            ]);

        return Inertia::render('MyCategories', [
            'categories' => $categories,
            'attachedIds' => $attachedIds,
            'pendingIds' => $pendingIds,
            'requests' => $requests,
        ]);
    }

    public function store(StoreCategoryRequestRequest $request): RedirectResponse
    {
        $this->authorize('create', CategoryRequest::class);

        /** @var User $user */
        $user = auth()->user();
        /** @var Brand $brand */
        $brand = $user->getBrand();

        DB::transaction(function () use ($request, $brand, $user) {
            $categoryRequest = CategoryRequest::create([
                'brand_id' => $brand->id,
                'user_id' => $user->id,
                'status' => CategoryRequest::STATUS_PENDING,
            ]);

            $categoryRequest->items()->createMany(
                array_map(fn ($id) => [
                    'category_id' => (int) $id,
                    'status' => CategoryRequestItem::STATUS_PENDING,
                ], $request->input('category_ids'))
            );
        });

        return redirect()->route('admin.my-categories')
            ->with('success', __('admin.category_requests.messages.created'));
    }
}
