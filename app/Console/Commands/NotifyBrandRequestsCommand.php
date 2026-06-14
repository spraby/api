<?php

namespace App\Console\Commands;

use App\Models\BrandRequest;
use App\Services\BrandRequestNotifier;
use Illuminate\Console\Command;

class NotifyBrandRequestsCommand extends Command
{
    protected $signature = 'brand-requests:notify {--limit=100 : Max requests to process per run}';

    protected $description = 'Detect brand requests created by the storefront (via Prisma) and queue notification emails';

    public function handle(BrandRequestNotifier $notifier): int
    {
        $limit = (int) ($this->option('limit') ?: 100);

        $requests = BrandRequest::query()
            ->whereNull('notified_at')
            ->orderBy('id')
            ->limit($limit)
            ->get();

        if ($requests->isEmpty()) {
            return self::SUCCESS;
        }

        $count = 0;
        foreach ($requests as $request) {
            try {
                $notifier->notifyCreated($request);
                $count++;
            } catch (\Throwable $e) {
                $this->error("Failed to notify brand request #{$request->id}: {$e->getMessage()}");
            }
        }

        $this->info("Queued notifications for {$count} brand request(s).");

        return self::SUCCESS;
    }
}
