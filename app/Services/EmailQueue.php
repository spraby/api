<?php

namespace App\Services;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class EmailQueue
{
    /**
     * Put a single email into the outgoing queue (email_messages table).
     *
     * @param  array{
     *     to_name?: string|null,
     *     from_email?: string|null,
     *     from_name?: string|null,
     *     reply_to?: string|null,
     *     locale?: string,
     *     scheduled_at?: \DateTimeInterface|null,
     *     source_model?: Model|null,
     *     max_attempts?: int,
     * }  $options
     */
    public function enqueue(
        string $templateKey,
        string $toEmail,
        string $subject,
        array $payload = [],
        array $options = []
    ): EmailMessage {
        $source = $options['source_model'] ?? null;

        return EmailMessage::create([
            'to_email' => $toEmail,
            'to_name' => $options['to_name'] ?? null,
            'from_email' => $options['from_email'] ?? null,
            'from_name' => $options['from_name'] ?? null,
            'reply_to' => $options['reply_to'] ?? null,
            'template_key' => $templateKey,
            'subject' => $subject,
            'payload' => $payload,
            'locale' => $options['locale'] ?? 'ru',
            'status' => EmailStatus::Pending,
            'max_attempts' => $options['max_attempts'] ?? 3,
            'scheduled_at' => $options['scheduled_at'] ?? now(),
            'source_type' => $source?->getMorphClass(),
            'source_id' => $source?->getKey(),
        ]);
    }

    /**
     * Same as enqueue() but for multiple recipients (creates one row per address).
     *
     * @param  string[]  $recipients
     * @return EmailMessage[]
     */
    public function enqueueMany(
        string $templateKey,
        array $recipients,
        string $subject,
        array $payload = [],
        array $options = []
    ): array {
        $messages = [];
        foreach (array_unique(array_filter($recipients)) as $email) {
            $messages[] = $this->enqueue($templateKey, $email, $subject, $payload, $options);
        }

        return $messages;
    }

    /**
     * Emails of all users with `admin` role. Used as recipient list for admin notifications.
     *
     * @return string[]
     */
    public function adminRecipients(): array
    {
        try {
            return User::role('admin')
                ->whereNotNull('email')
                ->pluck('email')
                ->all();
        } catch (\Throwable $e) {
            Log::warning('EmailQueue: failed to resolve admin recipients', ['error' => $e->getMessage()]);

            return [];
        }
    }
}
