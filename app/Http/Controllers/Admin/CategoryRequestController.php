<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessCategoryRequestItemsRequest;
use App\Models\CategoryRequest;
use App\Models\CategoryRequestItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CategoryRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CategoryRequest::class);

        $requests = CategoryRequest::with(['brand', 'user', 'reviewer', 'items.category'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CategoryRequest $r) => $this->serialize($r));

        return Inertia::render('CategoryRequests', [
            'categoryRequests' => $requests,
        ]);
    }

    public function show(CategoryRequest $categoryRequest): Response
    {
        $this->authorize('view', $categoryRequest);

        $categoryRequest->load(['brand', 'user', 'reviewer', 'items.category']);

        return Inertia::render('CategoryRequestShow', [
            'categoryRequest' => $this->serialize($categoryRequest),
        ]);
    }

    public function approve(ProcessCategoryRequestItemsRequest $request, CategoryRequest $categoryRequest): RedirectResponse
    {
        $this->authorize('update', $categoryRequest);

        DB::transaction(function () use ($request, $categoryRequest) {
            $items = $categoryRequest->items()
                ->whereIn('id', $request->input('item_ids'))
                ->where('status', CategoryRequestItem::STATUS_PENDING)
                ->get();

            if ($items->isEmpty()) {
                return;
            }

            $categoryIds = $items->pluck('category_id')->all();
            $categoryRequest->brand->categories()->syncWithoutDetaching($categoryIds);

            CategoryRequestItem::whereIn('id', $items->pluck('id'))
                ->update(['status' => CategoryRequestItem::STATUS_APPROVED]);

            $this->recomputeStatus($categoryRequest);
        });

        return redirect()->back()->with('success', __('admin.category_requests.messages.approved'));
    }

    public function reject(ProcessCategoryRequestItemsRequest $request, CategoryRequest $categoryRequest): RedirectResponse
    {
        $this->authorize('update', $categoryRequest);

        DB::transaction(function () use ($request, $categoryRequest) {
            $items = $categoryRequest->items()
                ->whereIn('id', $request->input('item_ids'))
                ->where('status', CategoryRequestItem::STATUS_PENDING)
                ->get();

            if ($items->isEmpty()) {
                return;
            }

            CategoryRequestItem::whereIn('id', $items->pluck('id'))->update([
                'status' => CategoryRequestItem::STATUS_REJECTED,
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            $this->recomputeStatus($categoryRequest);
        });

        return redirect()->back()->with('success', __('admin.category_requests.messages.rejected'));
    }

    private function recomputeStatus(CategoryRequest $categoryRequest): void
    {
        $counts = $categoryRequest->items()
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $pending = (int) ($counts[CategoryRequestItem::STATUS_PENDING] ?? 0);
        $approved = (int) ($counts[CategoryRequestItem::STATUS_APPROVED] ?? 0);
        $rejected = (int) ($counts[CategoryRequestItem::STATUS_REJECTED] ?? 0);

        $status = match (true) {
            $pending > 0 => CategoryRequest::STATUS_PENDING,
            $approved > 0 && $rejected > 0 => CategoryRequest::STATUS_PARTIAL,
            $rejected > 0 && $approved === 0 => CategoryRequest::STATUS_REJECTED,
            default => CategoryRequest::STATUS_APPROVED,
        };

        $categoryRequest->update([
            'status' => $status,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);
    }

    private function serialize(CategoryRequest $r): array
    {
        return [
            'id' => $r->id,
            'brand_id' => $r->brand_id,
            'user_id' => $r->user_id,
            'status' => $r->status,
            'comment' => $r->comment,
            'reviewed_at' => $r->reviewed_at?->toISOString(),
            'created_at' => $r->created_at->toISOString(),
            'updated_at' => $r->updated_at->toISOString(),
            'brand' => $r->brand ? [
                'id' => $r->brand->id,
                'name' => $r->brand->name,
            ] : null,
            'user' => $r->user ? [
                'id' => $r->user->id,
                'email' => $r->user->email,
                'first_name' => $r->user->first_name,
                'last_name' => $r->user->last_name,
            ] : null,
            'reviewer' => $r->reviewer ? [
                'id' => $r->reviewer->id,
                'email' => $r->reviewer->email,
                'first_name' => $r->reviewer->first_name,
                'last_name' => $r->reviewer->last_name,
            ] : null,
            'items' => $r->items->map(fn (CategoryRequestItem $item) => [
                'id' => $item->id,
                'category_id' => $item->category_id,
                'status' => $item->status,
                'rejection_reason' => $item->rejection_reason,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                    'handle' => $item->category->handle,
                ] : null,
            ])->values(),
        ];
    }
}
