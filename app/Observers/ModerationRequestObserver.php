<?php

namespace App\Observers;

use App\Models\Brand;
use App\Models\ModerationRequest;
use App\Services\EmailQueue;

class ModerationRequestObserver
{
    /** Письма ставим в очередь после коммита: до него заявки для получателя ещё нет. */
    public bool $afterCommit = true;

    public function __construct(protected EmailQueue $queue) {}

    public function created(ModerationRequest $request): void
    {
        if (! $this->isBrandPage($request)) {
            return;
        }

        $admins = $this->queue->adminRecipients();

        if (empty($admins)) {
            return;
        }

        $payload = array_merge($this->payloadFor($request), [
            'admin_url' => rtrim(config('app.url'), '/').'/admin/moderation/'.$request->id,
        ]);

        $this->queue->enqueueMany(
            templateKey: 'brand_page_request_created_admin',
            recipients: $admins,
            subject: 'Заявка на публикацию страницы бренда: '.($payload['brand_name'] ?? '—'),
            payload: $payload,
            options: ['source_model' => $request],
        );
    }

    public function updated(ModerationRequest $request): void
    {
        if (! $this->isBrandPage($request) || ! $request->wasChanged('status')) {
            return;
        }

        if ($request->status === ModerationRequest::STATUS_PENDING) {
            return;
        }

        // Письмо о решении идёт менеджеру — владельцу бренда.
        $owner = $this->brand($request)?->user;

        if (! $owner?->email) {
            return;
        }

        $isApproved = $request->status === ModerationRequest::STATUS_APPROVED;

        $payload = array_merge($this->payloadFor($request), [
            'status' => $request->status,
            'reason' => $request->reason,
            'user_name' => $owner->first_name,
            'reviewed_at' => $request->reviewed_at?->format('d.m.Y H:i'),
        ]);

        $this->queue->enqueue(
            templateKey: 'brand_page_request_reviewed_user',
            toEmail: $owner->email,
            subject: $isApproved
                ? 'Страница вашего бренда опубликована'
                : 'Заявка на публикацию страницы бренда отклонена',
            payload: $payload,
            options: ['to_name' => $owner->first_name, 'source_model' => $request],
        );
    }

    private function isBrandPage(ModerationRequest $request): bool
    {
        return $request->type === ModerationRequest::TYPE_BRAND_PAGE;
    }

    private function brand(ModerationRequest $request): ?Brand
    {
        $source = $request->source;

        return $source instanceof Brand ? $source : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function payloadFor(ModerationRequest $request): array
    {
        $brand = $this->brand($request);

        return [
            'request_id' => $request->id,
            'brand_name' => $brand?->name,
            'domain' => $brand?->domain,
            'page_url' => $brand?->pageUrl(),
            'user_name' => $brand?->user?->first_name,
            'user_email' => $brand?->user?->email,
            'created_at' => $request->created_at?->format('d.m.Y H:i'),
        ];
    }
}
