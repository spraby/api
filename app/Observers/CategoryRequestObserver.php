<?php

namespace App\Observers;

use App\Models\CategoryRequest;
use App\Services\EmailQueue;

class CategoryRequestObserver
{
    /**
     * Defer handlers until the surrounding DB transaction commits, so that the
     * request's items (created right after the parent in MyCategoriesController)
     * are available when we build the email payload.
     */
    public bool $afterCommit = true;

    public function __construct(protected EmailQueue $queue) {}

    public function created(CategoryRequest $request): void
    {
        $payload = array_merge($this->payloadFor($request), [
            'categories' => $this->categoryNames($request),
        ]);

        $userEmail = $request->user?->email;
        $userName = $request->user?->first_name;

        if ($userEmail) {
            $this->queue->enqueue(
                templateKey: 'category_request_created_user',
                toEmail: $userEmail,
                subject: 'Ваша заявка на категории принята',
                payload: $payload,
                options: ['to_name' => $userName, 'source_model' => $request],
            );
        }

        $admins = $this->queue->adminRecipients();
        if (! empty($admins)) {
            $adminPayload = array_merge($payload, [
                'admin_url' => rtrim(config('app.url'), '/').'/admin/category-requests/'.$request->id,
            ]);
            $this->queue->enqueueMany(
                templateKey: 'category_request_created_admin',
                recipients: $admins,
                subject: 'Новая заявка на категории: '.($request->brand?->name ?? '—'),
                payload: $adminPayload,
                options: ['source_model' => $request],
            );
        }
    }

    public function updated(CategoryRequest $request): void
    {
        if (! $request->wasChanged('status')) {
            return;
        }

        $status = $request->status;
        if ($status === CategoryRequest::STATUS_PENDING) {
            return;
        }

        $userEmail = $request->user?->email;
        if (! $userEmail) {
            return;
        }

        $subject = match ($status) {
            CategoryRequest::STATUS_APPROVED => 'Ваша заявка на категории одобрена',
            CategoryRequest::STATUS_PARTIAL => 'Заявка на категории рассмотрена частично',
            CategoryRequest::STATUS_REJECTED => 'Ваша заявка на категории отклонена',
            default => 'Заявка на категории рассмотрена',
        };

        $payload = array_merge($this->payloadFor($request), [
            'status' => $status,
            'category_items' => $this->categoryItems($request),
        ]);

        $this->queue->enqueue(
            templateKey: 'category_request_reviewed_user',
            toEmail: $userEmail,
            subject: $subject,
            payload: $payload,
            options: ['to_name' => $request->user?->first_name, 'source_model' => $request],
        );
    }

    protected function payloadFor(CategoryRequest $request): array
    {
        return [
            'request_id' => $request->id,
            'brand_name' => $request->brand?->name,
            'user_name' => $request->user?->first_name,
            'user_email' => $request->user?->email,
            'comment' => $request->comment,
            'created_at' => $request->created_at?->format('d.m.Y H:i'),
        ];
    }

    /**
     * @return string[]
     */
    protected function categoryNames(CategoryRequest $request): array
    {
        return $request->loadMissing('items.category')->items
            ->map(fn ($item) => $item->category?->name)
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{name: string, status: string}>
     */
    protected function categoryItems(CategoryRequest $request): array
    {
        return $request->loadMissing('items.category')->items
            ->filter(fn ($item) => $item->category?->name)
            ->map(fn ($item) => [
                'name' => $item->category->name,
                'status' => $item->status,
            ])
            ->values()
            ->all();
    }
}
