<?php

namespace App\Console\Commands;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;
use App\Services\EmailSender;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProcessEmailsCommand extends Command
{
    protected $signature = 'emails:process {--limit= : Override batch size}';

    protected $description = 'Send pending emails from the email_messages queue via Resend';

    public function handle(EmailSender $sender): int
    {
        if (! config('resend.api_key')) {
            $this->error('RESEND_API_KEY is not configured.');

            return self::FAILURE;
        }

        $limit = (int) ($this->option('limit') ?: config('resend.batch_size'));
        $delay = max(0, (int) config('resend.send_delay_seconds'));

        $claimed = $this->claimBatch($limit);
        if ($claimed->isEmpty()) {
            return self::SUCCESS;
        }

        $sentCount = 0;
        $failedCount = 0;
        $index = 0;

        foreach ($claimed as $message) {
            if ($index > 0 && $delay > 0) {
                sleep($delay);
            }

            if ($sender->send($message)) {
                $sentCount++;
            } else {
                $failedCount++;
            }

            $index++;
        }

        $this->info("Processed: {$claimed->count()} | Sent: {$sentCount} | Failed: {$failedCount}");

        return self::SUCCESS;
    }

    /**
     * Atomically pick up to $limit due messages and mark them as processing.
     * Avoids double-pickup if the command overlaps with itself or with the
     * controller's manual resend flow. Attempts are NOT incremented here —
     * EmailSender::send() owns that lifecycle field.
     */
    protected function claimBatch(int $limit): Collection
    {
        return DB::transaction(function () use ($limit) {
            $ids = EmailMessage::query()
                ->dueNow()
                ->orderBy('scheduled_at')
                ->limit($limit)
                ->lockForUpdate()
                ->pluck('id');

            if ($ids->isEmpty()) {
                return new Collection;
            }

            EmailMessage::query()
                ->whereIn('id', $ids)
                ->update([
                    'status' => EmailStatus::Processing->value,
                    'updated_at' => now(),
                ]);

            return EmailMessage::query()->whereIn('id', $ids)->get();
        });
    }
}
