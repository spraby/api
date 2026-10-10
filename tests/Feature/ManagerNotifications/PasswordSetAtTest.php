<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\BrandRequest;
use App\Models\User;
use App\Services\PasswordSetupService;
use Database\Seeders\BackfillPasswordSetAtSeeder;

class PasswordSetAtTest extends ManagerNotificationTestCase
{
    public function test_setting_the_password_by_link_records_the_moment(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['password' => null])->save();
        $user->assignRole('manager');

        $service = app(PasswordSetupService::class);
        $url = $service->generateUrl($user);
        $token = basename(parse_url($url, PHP_URL_PATH));

        $this->travelTo($this->minsk('2026-10-05 15:00'));
        $service->consumeAndSetPassword($token, 'new-password-123');

        $this->assertTrue($user->fresh()->password_set_at->eq($this->minsk('2026-10-05 15:00')));
    }

    public function test_backfill_fills_only_managers_with_a_password_and_no_date(): void
    {
        $withPassword = $this->manager(null);

        $withoutPassword = $this->manager(null);
        $withoutPassword->forceFill(['password' => null])->save();

        $alreadySet = $this->manager($this->minsk('2026-01-01 10:00'));

        $notManager = User::factory()->create();

        $this->travelTo($this->minsk('2026-10-10 12:00'));
        $this->seed(BackfillPasswordSetAtSeeder::class);

        $this->assertTrue($withPassword->fresh()->password_set_at->eq($this->minsk('2026-10-10 12:00')));
        $this->assertNull($withoutPassword->fresh()->password_set_at);
        $this->assertTrue($alreadySet->fresh()->password_set_at->eq($this->minsk('2026-01-01 10:00')));
        $this->assertNull($notManager->fresh()->password_set_at);
    }

    public function test_approving_an_account_that_already_has_a_password_records_the_moment(): void
    {
        // Такой аккаунт ссылку на установку пароля не получит.
        $existing = User::factory()->create(['email' => 'seller@example.com']);
        $request = BrandRequest::create([
            'email' => 'seller@example.com',
            'name' => 'Seller',
            'brand_name' => 'Seller Brand',
            'status' => BrandRequest::STATUS_PENDING,
        ]);

        $this->travelTo($this->minsk('2026-10-07 12:00'));
        $this->actingAs($this->admin())
            ->post(route('admin.brand-requests.approve', $request))
            ->assertSessionHasNoErrors();

        $fresh = $existing->fresh();
        $this->assertTrue($fresh->hasRole('manager'));
        $this->assertTrue($fresh->password_set_at->eq($this->minsk('2026-10-07 12:00')));
    }

    public function test_approving_an_account_without_password_leaves_the_date_to_the_setup_link(): void
    {
        $request = BrandRequest::create([
            'email' => 'new-seller@example.com',
            'name' => 'New Seller',
            'brand_name' => 'New Brand',
            'status' => BrandRequest::STATUS_PENDING,
        ]);

        $this->actingAs($this->admin())->post(route('admin.brand-requests.approve', $request));

        $this->assertNull(User::where('email', 'new-seller@example.com')->sole()->password_set_at);
    }
}
