<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailStatus;
use App\Http\Controllers\Controller;
use App\Models\BrandRequest;
use App\Models\CategoryRequest;
use App\Models\EmailMessage;
use App\Models\Order;
use App\Services\EmailQueue;
use App\Services\EmailSender;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class EmailMessageController extends Controller
{
    /**
     * Show the email messages list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', EmailMessage::class);

        $emails = EmailMessage::query()
            ->orderByDesc('id')
            ->limit(1000)
            ->get()
            ->map(fn (EmailMessage $message) => [
                'id' => $message->id,
                'to_email' => $message->to_email,
                'to_name' => $message->to_name,
                'template_key' => $message->template_key,
                'subject' => $message->subject,
                'locale' => $message->locale,
                'status' => $message->status->value,
                'attempts' => $message->attempts,
                'max_attempts' => $message->max_attempts,
                'last_error' => $message->last_error,
                'scheduled_at' => $message->scheduled_at?->toISOString(),
                'sent_at' => $message->sent_at?->toISOString(),
                'created_at' => $message->created_at->toISOString(),
            ]);

        return Inertia::render('Emails', [
            'emails' => $emails,
            'templateKeys' => EmailMessage::query()
                ->distinct()
                ->orderBy('template_key')
                ->pluck('template_key'),
        ]);
    }

    /**
     * Show a single email with full payload and rendered HTML preview.
     */
    public function show(EmailMessage $email, EmailSender $sender): Response
    {
        $this->authorize('view', $email);

        return Inertia::render('EmailShow', [
            'email' => [
                'id' => $email->id,
                'to_email' => $email->to_email,
                'to_name' => $email->to_name,
                'from_email' => $email->from_email,
                'from_name' => $email->from_name,
                'reply_to' => $email->reply_to,
                'template_key' => $email->template_key,
                'subject' => $email->subject,
                'payload' => $email->payload ?? [],
                'locale' => $email->locale,
                'status' => $email->status->value,
                'attempts' => $email->attempts,
                'max_attempts' => $email->max_attempts,
                'last_error' => $email->last_error,
                'scheduled_at' => $email->scheduled_at?->toISOString(),
                'sent_at' => $email->sent_at?->toISOString(),
                'created_at' => $email->created_at->toISOString(),
                'updated_at' => $email->updated_at->toISOString(),
                'source' => $this->resolveSource($email),
                'resend_url' => $email->resend_id ? 'https://resend.com/emails/'.$email->resend_id : null,
                'html_preview' => $this->safeRenderPreview($sender, $email),
            ],
        ]);
    }

    /**
     * Re-queue a failed email for another attempt.
     */
    public function retry(EmailMessage $email): RedirectResponse
    {
        $this->authorize('update', $email);

        if ($email->status !== EmailStatus::Failed) {
            return redirect()->back()->with('error', 'Only failed emails can be retried.');
        }

        $email->update([
            'status' => EmailStatus::Pending,
            'attempts' => 0,
            'last_error' => null,
            'scheduled_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Email re-queued.');
    }

    /**
     * Cancel a pending email so it won't be sent.
     */
    public function cancel(EmailMessage $email): RedirectResponse
    {
        $this->authorize('update', $email);

        if ($email->status !== EmailStatus::Pending) {
            return redirect()->back()->with('error', 'Only pending emails can be cancelled.');
        }

        $email->update([
            'status' => EmailStatus::Failed,
            'last_error' => 'Cancelled by '.(auth()->user()?->email ?? 'admin'),
        ]);

        return redirect()->back()->with('success', 'Email cancelled.');
    }

    /**
     * Delete an email message permanently.
     */
    public function destroy(EmailMessage $email): RedirectResponse
    {
        $this->authorize('delete', $email);

        $email->delete();

        return redirect()->route('admin.emails')->with('success', 'Email deleted.');
    }

    /**
     * Enqueue a brand-new copy of the same email to the original recipient.
     * Unlike retry(), this creates a new row instead of resetting the existing one,
     * so the original delivery history is preserved.
     */
    public function resend(EmailMessage $email, EmailQueue $queue, EmailSender $sender): RedirectResponse
    {
        $this->authorize('update', $email);

        $copy = $queue->enqueue(
            templateKey: $email->template_key,
            toEmail: $email->to_email,
            subject: $email->subject,
            payload: $email->payload ?? [],
            options: [
                'to_name' => $email->to_name,
                'from_email' => $email->from_email,
                'from_name' => $email->from_name,
                'reply_to' => $email->reply_to,
                'locale' => $email->locale,
                'max_attempts' => $email->max_attempts,
            ],
        );

        $ok = $sender->send($copy);

        if ($ok) {
            return redirect()->back()->with('success', 'Email sent to '.$copy->to_email);
        }

        $copy->refresh();

        return redirect()->back()->with(
            'error',
            'Failed to send: '.($copy->last_error ?: 'unknown error'),
        );
    }

    /**
     * Re-enqueue the same template with the original payload, but addressed to the current user.
     * Used for previewing a real send in admin's own inbox.
     */
    public function sendCopy(EmailMessage $email, EmailQueue $queue, EmailSender $sender): RedirectResponse
    {
        $this->authorize('update', $email);

        $admin = auth()->user();
        if (! $admin?->email) {
            return redirect()->back()->with('error', 'Current user has no email to send copy to.');
        }

        $copy = $queue->enqueue(
            templateKey: $email->template_key,
            toEmail: $admin->email,
            subject: '[TEST] '.$email->subject,
            payload: $email->payload ?? [],
            options: [
                'to_name' => trim(($admin->first_name ?? '').' '.($admin->last_name ?? '')) ?: null,
                'locale' => $email->locale,
            ],
        );

        $ok = $sender->send($copy);

        if ($ok) {
            return redirect()->back()->with('success', 'Test copy sent to '.$admin->email);
        }

        $copy->refresh();

        return redirect()->back()->with(
            'error',
            'Failed to send test copy: '.($copy->last_error ?: 'unknown error'),
        );
    }

    /**
     * Resolve the polymorphic source to a small descriptor for the UI.
     */
    protected function resolveSource(EmailMessage $email): ?array
    {
        if (! $email->source_type || ! $email->source_id) {
            return null;
        }

        $label = match ($email->source_type) {
            BrandRequest::class => 'Brand Request',
            CategoryRequest::class => 'Category Request',
            Order::class => 'Order',
            default => class_basename($email->source_type),
        };

        $adminUrl = match ($email->source_type) {
            BrandRequest::class => '/admin/brand-requests/'.$email->source_id,
            CategoryRequest::class => '/admin/category-requests/'.$email->source_id,
            Order::class => '/admin/orders/'.$email->source_id,
            default => null,
        };

        return [
            'type' => $email->source_type,
            'id' => $email->source_id,
            'label' => $label,
            'admin_url' => $adminUrl,
        ];
    }

    /**
     * Render the Blade template via EmailSender, swallowing errors so a broken
     * template doesn't break the details page itself.
     */
    protected function safeRenderPreview(EmailSender $sender, EmailMessage $email): ?string
    {
        try {
            return $sender->renderHtml($email);
        } catch (Throwable) {
            return null;
        }
    }
}
