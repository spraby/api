<?php

namespace App\Observers;

use App\Models\BrandRequest;
use App\Services\BrandRequestNotifier;

class BrandRequestObserver
{
    public function __construct(protected BrandRequestNotifier $notifier) {}

    /**
     * Fires only for requests created through Eloquent. Storefront requests are
     * inserted directly via Prisma (bypassing Eloquent events) and are picked up
     * by the `brand-requests:notify` scheduled command instead. Both paths funnel
     * through BrandRequestNotifier, which is idempotent via `notified_at`.
     *
     * Approval/rejection emails are NOT handled here: they are dispatched
     * explicitly from BrandRequestController (approval needs the freshly-issued
     * password-setup link), which keeps the token and its email together.
     */
    public function created(BrandRequest $request): void
    {
        $this->notifier->notifyCreated($request);
    }
}
