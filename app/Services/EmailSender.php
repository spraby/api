<?php

namespace App\Services;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Resend;
use Resend\Client;
use RuntimeException;
use Throwable;

class EmailSender
{
    protected ?Client $client = null;

    /**
     * Send a single EmailMessage immediately via Resend.
     * Updates the row's status, attempts, sent_at, last_error in-place.
     *
     * Returns true on success, false on failure.
     * Caller may inspect $message->refresh()->status afterwards.
     */
    public function send(EmailMessage $message): bool
    {
        $apiKey = config('resend.api_key');
        if (! $apiKey) {
            $this->markFailed($message, new RuntimeException('RESEND_API_KEY is not configured.'));

            return false;
        }

        $message->forceFill([
            'status' => EmailStatus::Processing,
            'attempts' => $message->attempts + 1,
        ])->save();

        try {
            $resendId = $this->dispatchToResend($apiKey, $message);

            $message->forceFill([
                'status' => EmailStatus::Sent,
                'sent_at' => now(),
                'last_error' => null,
                'resend_id' => $resendId,
            ])->save();

            return true;
        } catch (Throwable $e) {
            $this->markFailed($message, $e);

            return false;
        }
    }

    /**
     * Render the email's Blade template with its payload, using the message's locale.
     * Used by both real sending and the admin UI preview.
     *
     * @throws Throwable on missing template or rendering errors
     */
    public function renderHtml(EmailMessage $message): string
    {
        $viewName = "emails.{$message->template_key}";
        if (! View::exists($viewName)) {
            throw new RuntimeException("Email template view [{$viewName}] not found.");
        }

        $previousLocale = App::getLocale();
        App::setLocale($message->locale ?: 'ru');

        try {
            return View::make($viewName, array_merge(
                $message->payload ?? [],
                [
                    'subject' => $message->subject,
                    'toEmail' => $message->to_email,
                    'toName' => $message->to_name,
                ],
            ))->render();
        } finally {
            App::setLocale($previousLocale);
        }
    }

    /**
     * Sends the email and returns Resend's message id (used to build a link to
     * the Resend dashboard: https://resend.com/emails/{id}).
     *
     * @throws Throwable
     */
    protected function dispatchToResend(string $apiKey, EmailMessage $message): ?string
    {
        $html = $this->renderHtml($message);

        $fromAddress = $message->from_email ?: config('resend.from.address');
        $fromName = $message->from_name ?: config('resend.from.name');
        $replyTo = $message->reply_to ?: config('resend.reply_to');

        $payload = [
            'from' => $this->formatAddress($fromAddress, $fromName),
            'to' => [$this->formatAddress($message->to_email, $message->to_name)],
            'subject' => $message->subject,
            'html' => $html,
        ];

        if ($replyTo) {
            $payload['reply_to'] = [$replyTo];
        }

        $response = $this->client($apiKey)->emails->send($payload);

        return $response->id ?? null;
    }

    protected function markFailed(EmailMessage $message, Throwable $e): void
    {
        $backoff = (int) config('resend.retry_backoff_minutes');
        $isLastAttempt = $message->attempts >= $message->max_attempts;

        $message->forceFill([
            'status' => $isLastAttempt ? EmailStatus::Failed : EmailStatus::Pending,
            'last_error' => mb_substr($e->getMessage(), 0, 1000),
            'scheduled_at' => $isLastAttempt
                ? $message->scheduled_at
                : now()->addMinutes($backoff * max(1, $message->attempts)),
        ])->save();

        Log::warning('EmailSender — send failed', [
            'id' => $message->id,
            'template' => $message->template_key,
            'to' => $message->to_email,
            'attempt' => $message->attempts,
            'error' => $e->getMessage(),
        ]);
    }

    protected function formatAddress(?string $email, ?string $name): string
    {
        if (! $email) {
            return '';
        }

        return $name ? "{$name} <{$email}>" : $email;
    }

    protected function client(string $apiKey): Client
    {
        return $this->client ??= Resend::client($apiKey);
    }
}
