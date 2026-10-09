<?php

namespace Tests\Feature\Auth;

use App\Models\EmailMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Request a reset link and pull the plaintext token out of the queued email.
     */
    private function requestToken(User $user): string
    {
        $this->post('/admin/forgot-password', ['email' => $user->email]);

        $url = EmailMessage::where('template_key', 'password_reset')
            ->where('to_email', $user->email)
            ->sole()
            ->payload['reset_url'];

        $this->assertSame(1, preg_match('#/admin/reset-password/([^?]+)#', $url, $m), "No token in reset URL: {$url}");

        return $m[1];
    }

    public function test_login_page_links_to_password_reset(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Auth/Login', false)
                ->where('canResetPassword', true));
    }

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $this->get('/admin/forgot-password')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Auth/ForgotPassword', false));
    }

    public function test_reset_link_is_queued_through_the_email_queue(): void
    {
        $user = User::factory()->create();

        $this->from('/admin/forgot-password')
            ->post('/admin/forgot-password', ['email' => $user->email])
            ->assertRedirect('/admin/forgot-password')
            ->assertSessionHas('status');

        $message = EmailMessage::where('template_key', 'password_reset')->sole();
        $this->assertSame($user->email, $message->to_email);
        $this->assertStringContainsString('/admin/reset-password/', $message->payload['reset_url']);
        $this->assertDatabaseCount('password_reset_tokens', 1);
    }

    public function test_reset_link_ignores_forged_host_headers(): void
    {
        config(['app.url' => 'https://api.spra.by']);
        $user = User::factory()->create();

        $this->withHeaders(['Host' => 'evil.example', 'X-Forwarded-Host' => 'evil.example'])
            ->post('/admin/forgot-password', ['email' => $user->email]);

        $url = EmailMessage::where('template_key', 'password_reset')->sole()->payload['reset_url'];
        $this->assertStringStartsWith('https://api.spra.by/admin/reset-password/', $url);
    }

    public function test_unknown_email_gets_the_same_response_and_no_email(): void
    {
        $this->from('/admin/forgot-password')
            ->post('/admin/forgot-password', ['email' => 'nobody@example.com'])
            ->assertRedirect('/admin/forgot-password')
            ->assertSessionHas('status')
            ->assertSessionHasNoErrors();

        $this->assertSame(0, EmailMessage::where('template_key', 'password_reset')->count());
    }

    public function test_user_without_password_is_not_sent_a_reset_link(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['password' => null])->save();

        $this->post('/admin/forgot-password', ['email' => $user->email])
            ->assertSessionHas('status');

        $this->assertSame(0, EmailMessage::where('template_key', 'password_reset')->count());
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();
        $token = $this->requestToken($user);

        $this->get('/admin/reset-password/'.$token.'?email='.urlencode($user->email))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Auth/ResetPassword', false)
                ->where('token', $token)
                ->where('email', $user->email));
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = $this->requestToken($user);

        $this->post('/admin/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.login'));

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_reset_signs_the_user_out_everywhere(): void
    {
        config(['session.driver' => 'database']);

        $user = User::factory()->create();
        $user->forceFill(['remember_token' => 'old-remember-token'])->save();
        $other = User::factory()->create();

        DB::table('sessions')->insert([
            ['id' => 'victim-laptop', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()],
            ['id' => 'someone-else', 'user_id' => $other->id, 'payload' => '', 'last_activity' => time()],
        ]);

        $this->post('/admin/reset-password', [
            'token' => $this->requestToken($user),
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('sessions', ['id' => 'victim-laptop']);
        $this->assertDatabaseHas('sessions', ['id' => 'someone-else']);
        $this->assertNotSame('old-remember-token', $user->fresh()->getRememberToken());
    }

    public function test_token_cannot_be_used_twice(): void
    {
        $user = User::factory()->create();
        $token = $this->requestToken($user);

        $payload = [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ];

        $this->post('/admin/reset-password', $payload)->assertSessionHasNoErrors();

        $this->post('/admin/reset-password', ['password' => 'another-pass-456', 'password_confirmation' => 'another-pass-456'] + $payload)
            ->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_password_is_not_reset_with_invalid_token(): void
    {
        $user = User::factory()->create(['password' => bcrypt('old-password-123')]);
        $this->requestToken($user);

        $this->post('/admin/reset-password', [
            'token' => 'wrong-token',
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check('old-password-123', $user->fresh()->password));
    }

    public function test_reset_link_email_renders(): void
    {
        $user = User::factory()->create();
        $this->requestToken($user);

        $message = EmailMessage::where('template_key', 'password_reset')->sole();
        $html = app(\App\Services\EmailSender::class)->renderHtml($message);

        $this->assertStringContainsString($message->payload['reset_url'], $html);
    }
}
