<?php

namespace Tests\Feature\Admin;

use App\Models\EmailMessage;
use App\Models\User;
use App\Services\EmailQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Password reset / setup links carry live tokens. The admin email log must
 * not let an admin read or forward them to themselves.
 */
class EmailLogSecretLinksTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET_URL = 'https://api.spra.by/admin/reset-password/live-token?email=victim%40example.com';

    private User $admin;

    private EmailMessage $message;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('admin')->syncPermissions(User::ADMIN_PERMISSIONS);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->message = app(EmailQueue::class)->enqueue(
            templateKey: 'password_reset',
            toEmail: 'victim@example.com',
            subject: 'Восстановление пароля',
            payload: ['name' => 'Victim', 'reset_url' => self::SECRET_URL, 'expires_minutes' => 60],
        );
    }

    public function test_show_redacts_secret_link_in_payload_and_preview(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.emails.show', $this->message))
            ->assertOk()
            ->assertDontSee('live-token', false)
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('email.payload.reset_url', EmailMessage::REDACTED)
                ->where('email.payload.name', 'Victim')
                ->where('email.html_preview', fn (?string $html) => $html !== null
                    && ! str_contains($html, 'live-token')));
    }

    public function test_send_copy_does_not_forward_secret_link(): void
    {
        config(['resend.api_key' => null]);

        $this->actingAs($this->admin)
            ->post(route('admin.emails.send-copy', $this->message));

        $copy = EmailMessage::where('to_email', $this->admin->email)->sole();
        $this->assertSame(EmailMessage::REDACTED, $copy->payload['reset_url']);

        // The original row still holds the real link for actual delivery.
        $this->assertSame(self::SECRET_URL, $this->message->fresh()->payload['reset_url']);
    }
}
