<?php

namespace App\Services;

use App\Models\BrandRequest;
use App\Models\User;

class BrandRequestNotifier
{
    public function __construct(protected EmailQueue $queue) {}

    /**
     * Queue the "brand request created" emails (applicant + admins) and mark the
     * request as notified so it is not picked up again by the scanner.
     *
     * Idempotent: a request that already has `notified_at` set is skipped.
     */
    public function notifyCreated(BrandRequest $request): void
    {
        if ($request->notified_at !== null) {
            return;
        }

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

        $request->forceFill(['notified_at' => now()])->saveQuietly();
    }

    /**
     * Queue the approval emails. When a password-setup link is provided (the
     * common case — a brand-new account), the applicant gets an "approved"
     * notice plus a separate email carrying the one-time link. When it is null
     * (the email belongs to an existing account that already has a password),
     * we instead point them straight to the login page and skip the link.
     */
    public function notifyApproved(BrandRequest $request, ?string $setPasswordUrl): void
    {
        $userEmail = $request->email ?: $request->user?->email;
        if (! $userEmail) {
            return;
        }

        $payload = $this->payloadFor($request);

        $this->queue->enqueue(
            templateKey: 'brand_request_approved_user',
            toEmail: $userEmail,
            subject: 'Ваша заявка одобрена',
            payload: array_merge($payload, [
                'password_setup' => $setPasswordUrl !== null,
                'login_url' => rtrim(config('app.url'), '/').'/admin/login',
            ]),
            options: ['to_name' => $request->name, 'source_model' => $request],
        );

        if ($setPasswordUrl === null) {
            return;
        }

        $this->queue->enqueue(
            templateKey: 'brand_request_set_password',
            toEmail: $userEmail,
            subject: 'Установите пароль для входа',
            payload: array_merge($payload, [
                'set_password_url' => $setPasswordUrl,
                'expires_hours' => PasswordSetupService::TTL_HOURS,
            ]),
            options: ['to_name' => $request->name, 'source_model' => $request],
        );
    }

    /**
     * Queue the rejection email, including the admin's reason if provided.
     */
    public function notifyRejected(BrandRequest $request): void
    {
        $userEmail = $request->email ?: $request->user?->email;
        if (! $userEmail) {
            return;
        }

        $this->queue->enqueue(
            templateKey: 'brand_request_rejected_user',
            toEmail: $userEmail,
            subject: 'Ваша заявка отклонена',
            payload: array_merge($this->payloadFor($request), [
                'rejection_reason' => $request->rejection_reason,
            ]),
            options: ['to_name' => $request->name, 'source_model' => $request],
        );
    }

    /**
     * Notify admins that an approved manager has set their password and is ready
     * to work. Fires once per activation (the setup token is single-use).
     */
    public function notifyPasswordSet(User $user): void
    {
        $admins = $this->queue->adminRecipients();
        if (empty($admins)) {
            return;
        }

        $request = BrandRequest::query()
            ->where('user_id', $user->id)
            ->where('status', BrandRequest::STATUS_APPROVED)
            ->latest('approved_at')
            ->first();

        $brand = $user->brands()->first();
        $brandName = $request?->brand_name ?? $brand?->name;

        $appUrl = rtrim(config('app.url'), '/');
        $adminUrl = $request
            ? $appUrl.'/admin/brand-requests/'.$request->id
            : $appUrl.'/admin/users/'.$user->id.'/edit';

        $this->queue->enqueueMany(
            templateKey: 'manager_password_set_admin',
            recipients: $admins,
            subject: 'Продавец готов к работе: '.($brandName ?? $user->email),
            payload: [
                'user_name' => $user->first_name,
                'user_email' => $user->email,
                'brand_name' => $brandName,
                'admin_url' => $adminUrl,
            ],
            options: ['source_model' => $request ?? $user],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function payloadFor(BrandRequest $request): array
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