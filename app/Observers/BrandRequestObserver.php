<?php

namespace App\Observers;

use App\Models\BrandRequest;
use App\Services\EmailQueue;

class BrandRequestObserver
{
    public function __construct(protected EmailQueue $queue) {}

    public function created(BrandRequest $request): void
    {
        $payload = $this->payloadFor($request);

        $userEmail = $request->email ?: $request->user?->email;
        if ($userEmail) {
            $this->queue->enqueue(
                templateKey: 'brand_request_created_user',
                toEmail: $userEmail,
                subject: 'Ваша заявка принята',
                payload: $payload,
                options: ['to_name' => $request->name, 'source_model' => $request],
            );
        }

        $admins = $this->queue->adminRecipients();
        if (! empty($admins)) {
            $adminPayload = array_merge($payload, [
                'admin_url' => rtrim(config('app.url'), '/').'/admin/brand-requests/'.$request->id,
            ]);
            $this->queue->enqueueMany(
                templateKey: 'brand_request_created_admin',
                recipients: $admins,
                subject: 'Новая заявка на бренд: '.($request->brand_name ?? '—'),
                payload: $adminPayload,
                options: ['source_model' => $request],
            );
        }
    }

    public function updated(BrandRequest $request): void
    {
        if (! $request->wasChanged('status')) {
            return;
        }

        $userEmail = $request->email ?: $request->user?->email;
        if (! $userEmail) {
            return;
        }

        $payload = $this->payloadFor($request);

        if ($request->status === BrandRequest::STATUS_APPROVED) {
            $this->queue->enqueue(
                templateKey: 'brand_request_approved_user',
                toEmail: $userEmail,
                subject: 'Ваша заявка одобрена',
                payload: array_merge($payload, [
                    'login_url' => rtrim(config('app.url'), '/').'/admin/login',
                ]),
                options: ['to_name' => $request->name, 'source_model' => $request],
            );

            return;
        }

        if ($request->status === BrandRequest::STATUS_REJECTED) {
            $this->queue->enqueue(
                templateKey: 'brand_request_rejected_user',
                toEmail: $userEmail,
                subject: 'Ваша заявка отклонена',
                payload: array_merge($payload, [
                    'rejection_reason' => $request->rejection_reason,
                ]),
                options: ['to_name' => $request->name, 'source_model' => $request],
            );
        }
    }

    protected function payloadFor(BrandRequest $request): array
    {
        return [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'brand_name' => $request->brand_name,
            'created_at' => $request->created_at?->format('d.m.Y H:i'),
        ];
    }
}
