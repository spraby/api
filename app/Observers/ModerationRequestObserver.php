<?php

namespace App\Observers;

use App\Models\Brand;
use App\Models\ModerationRequest;
use App\Services\EmailQueue;

class ModerationRequestObserver
{
    /** Письма ставим в очередь после коммита: до него заявки для получателя ещё нет. */
    public bool $afterCommit = true;

    /**
     * Письма по типам заявок: шаблоны и темы. Тип без записи здесь
     * писем не шлёт.
     */
    private const MAIL = [
        ModerationRequest::TYPE_BRAND_PAGE => [
            'created_template' => 'brand_page_request_created_admin',
            'created_subject' => 'Заявка на публикацию страницы бренда: ',
            'reviewed_template' => 'brand_page_request_reviewed_user',
            'approved_subject' => 'Страница вашего бренда опубликована',
            'rejected_subject' => 'Заявка на публикацию страницы бренда отклонена',
        ],
        ModerationRequest::TYPE_BRAND_TYPE => [
            'created_template' => 'brand_type_request_created_admin',
            'created_subject' => 'Заявка на смену типа аккаунта: ',
            'reviewed_template' => 'brand_type_request_reviewed_user',
            'approved_subject' => 'Тип аккаунта вашего бренда изменён',
            'rejected_subject' => 'Заявка на смену типа аккаунта отклонена',
        ],
    ];

    public function __construct(protected EmailQueue $queue) {}

    public function created(ModerationRequest $request): void
    {
        $mail = self::MAIL[$request->type] ?? null;

        if ($mail === null) {
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
            templateKey: $mail['created_template'],
            recipients: $admins,
            subject: $mail['created_subject'].($payload['brand_name'] ?? '—'),
            payload: $payload,
            options: ['source_model' => $request],
        );
    }

    public function updated(ModerationRequest $request): void
    {
        $mail = self::MAIL[$request->type] ?? null;

        if ($mail === null || ! $request->wasChanged('status')) {
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
            templateKey: $mail['reviewed_template'],
            toEmail: $owner->email,
            subject: $isApproved ? $mail['approved_subject'] : $mail['rejected_subject'],
            payload: $payload,
            options: ['to_name' => $owner->first_name, 'source_model' => $request],
        );
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
        $requested = $request->settings['requested'] ?? [];

        return [
            'request_id' => $request->id,
            'brand_name' => $brand?->name,
            'domain' => $brand?->domain,
            'page_url' => $brand?->pageUrl(),
            'user_name' => $brand?->user?->first_name,
            'user_email' => $brand?->user?->email,
            'created_at' => $request->created_at?->format('d.m.Y H:i'),
            // Для смены типа аккаунта: что запрошено (у страницы бренда пусто).
            'requested_type_label' => match ($requested['type'] ?? null) {
                Brand::TYPE_MASTER => 'Мастер',
                Brand::TYPE_BUSINESS => 'Бизнес',
                default => null,
            },
            'requested_employment_type_label' => Brand::employmentTypeLabel($requested['employment_type'] ?? null),
            'requested_employment_name' => $requested['employment_name'] ?? null,
            'requested_employment_number' => $requested['employment_number'] ?? null,
        ];
    }
}
