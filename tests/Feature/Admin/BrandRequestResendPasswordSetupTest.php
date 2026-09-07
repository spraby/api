<?php

namespace Tests\Feature\Admin;

use App\Models\BrandRequest;
use App\Models\EmailMessage;
use App\Models\PasswordSetupToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BrandRequestResendPasswordSetupTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        $adminRole = Role::findOrCreate('admin');
        $adminRole->syncPermissions(User::ADMIN_PERMISSIONS);

        $managerRole = Role::findOrCreate('manager');
        $managerRole->syncPermissions(User::MANAGER_PERMISSIONS);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /**
     * An approved applicant who has not set a password yet — the seller whose
     * link expired.
     */
    private function approvedRequestAwaitingPassword(): BrandRequest
    {
        $user = User::factory()->create();
        $user->forceFill(['password' => null])->save();
        $user->assignRole('manager');

        return BrandRequest::create([
            'email' => $user->email,
            'name' => 'Seller',
            'brand_name' => 'Test Brand',
            'status' => BrandRequest::STATUS_APPROVED,
            'user_id' => $user->id,
            'approved_at' => now(),
        ]);
    }

    private function resend(BrandRequest $request)
    {
        return $this->actingAs($this->admin)
            ->from('/admin/brand-requests/'.$request->id)
            ->post('/admin/brand-requests/'.$request->id.'/resend-password-setup');
    }

    public function test_admin_resend_issues_a_new_token_and_queues_the_email(): void
    {
        $request = $this->approvedRequestAwaitingPassword();

        $response = $this->resend($request);

        $response->assertRedirect('/admin/brand-requests/'.$request->id);
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('password_setup_tokens', 1);

        $message = EmailMessage::where('template_key', 'brand_request_set_password')->sole();
        $this->assertSame($request->email, $message->to_email);
        $this->assertStringContainsString('/admin/set-password/', $message->payload['set_password_url']);
    }

    public function test_resend_invalidates_the_previous_link(): void
    {
        $request = $this->approvedRequestAwaitingPassword();

        $this->resend($request);
        $first = PasswordSetupToken::query()->sole();

        $this->resend($request);

        $this->assertNotNull($first->refresh()->used_at, 'the earlier link must stop working');
        $this->assertSame(2, PasswordSetupToken::count());
        $this->assertSame(1, PasswordSetupToken::whereNull('used_at')->count());
    }

    public function test_the_new_link_actually_sets_the_password(): void
    {
        $request = $this->approvedRequestAwaitingPassword();

        $this->resend($request);

        $url = EmailMessage::where('template_key', 'brand_request_set_password')
            ->sole()->payload['set_password_url'];

        $this->get($url)->assertOk();

        $this->post($url, [
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($request->user->fresh());
    }

    public function test_resend_is_refused_for_a_user_who_already_has_a_password(): void
    {
        $request = $this->approvedRequestAwaitingPassword();
        $request->user->forceFill(['password' => bcrypt('already-set')])->save();

        $this->resend($request)->assertSessionHas('error');

        $this->assertDatabaseCount('password_setup_tokens', 0);
        // The observer's "request created" emails are expected; a setup link is not.
        $this->assertSame(0, EmailMessage::where('template_key', 'brand_request_set_password')->count());
    }

    public function test_resend_is_refused_for_a_pending_request(): void
    {
        $request = $this->approvedRequestAwaitingPassword();
        $request->update(['status' => BrandRequest::STATUS_PENDING]);

        $this->resend($request)->assertSessionHas('error');

        $this->assertDatabaseCount('password_setup_tokens', 0);
    }

    public function test_a_manager_cannot_resend(): void
    {
        $request = $this->approvedRequestAwaitingPassword();

        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this->actingAs($manager)
            ->post('/admin/brand-requests/'.$request->id.'/resend-password-setup')
            ->assertForbidden();

        $this->assertDatabaseCount('password_setup_tokens', 0);
    }
}
