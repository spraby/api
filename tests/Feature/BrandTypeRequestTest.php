<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\EmailMessage;
use App\Models\ModerationRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Заявка на смену типа аккаунта бренда (мастер/бизнес): подаёт продавец
 * в «Настройки → Основные», решает модератор в «Модерации».
 */
class BrandTypeRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;

    private User $admin;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['MANAGER'])->syncPermissions(User::MANAGER_PERMISSIONS);
        Role::findOrCreate(User::ROLES['ADMIN'])->syncPermissions(array_values(User::PERMISSIONS));

        $this->manager = User::factory()->create();
        $this->manager->assignRole(User::ROLES['MANAGER']);
        $this->brand = Brand::create([
            'user_id' => $this->manager->id,
            'name' => 'Master Brand',
            'type' => Brand::TYPE_MASTER,
            'employment_type' => 'craftsman',
        ]);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(User::ROLES['ADMIN']);
    }

    private function businessPayload(array $overrides = []): array
    {
        return [
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123 456 789',
            ...$overrides,
        ];
    }

    private function submit(array $payload)
    {
        return $this->actingAs($this->manager)
            ->post(route('admin.settings.brand-type-request.store'), $payload);
    }

    private function pendingRequest(): ModerationRequest
    {
        return ModerationRequest::query()
            ->where('type', ModerationRequest::TYPE_BRAND_TYPE)
            ->where('status', ModerationRequest::STATUS_PENDING)
            ->firstOrFail();
    }

    public function test_request_is_created_without_changing_brand(): void
    {
        $this->submit($this->businessPayload())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $request = $this->pendingRequest();

        $this->assertSame([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ], $request->settings['requested']);
        $this->assertSame(Brand::TYPE_MASTER, $request->settings['previous']['type']);

        // До решения модератора бренд не меняется.
        $this->assertSame(Brand::TYPE_MASTER, $this->brand->refresh()->type);
        $this->assertSame('craftsman', $this->brand->employment_type);
    }

    public function test_admins_are_notified_about_new_request(): void
    {
        $this->submit($this->businessPayload());

        $this->assertTrue(EmailMessage::query()
            ->where('template_key', 'brand_type_request_created_admin')
            ->where('to_email', $this->admin->email)
            ->exists());
    }

    public function test_business_requires_name_and_valid_unp(): void
    {
        $this->submit($this->businessPayload(['employment_name' => '', 'employment_number' => '12345']))
            ->assertSessionHasErrors(['employment_name', 'employment_number']);

        $this->assertSame(0, ModerationRequest::query()->count());
    }

    public function test_employment_type_must_match_account_type(): void
    {
        $this->submit($this->businessPayload(['employment_type' => 'craftsman']))
            ->assertSessionHasErrors('employment_type');

        $this->submit(['type' => Brand::TYPE_MASTER, 'employment_type' => 'llc'])
            ->assertSessionHasErrors('employment_type');
    }

    public function test_master_request_ignores_requisites(): void
    {
        // Форма занятости не указана — можно выбрать любой тип, в том числе мастера.
        $this->brand->update(['employment_type' => null]);

        $this->submit([
            'type' => Brand::TYPE_MASTER,
            'employment_type' => 'self_employed',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ])->assertSessionHasNoErrors();

        $requested = $this->pendingRequest()->settings['requested'];
        $this->assertNull($requested['employment_name']);
        $this->assertNull($requested['employment_number']);
    }

    public function test_second_request_is_blocked_while_first_is_pending(): void
    {
        $this->submit($this->businessPayload());

        $this->submit($this->businessPayload(['employment_type' => 'sole_proprietor']))
            ->assertSessionHas('error', __('admin.brand_type_request.errors.already_requested'));

        $this->assertSame(1, ModerationRequest::query()->count());
    }

    public function test_request_matching_current_values_is_rejected(): void
    {
        $this->submit(['type' => Brand::TYPE_MASTER, 'employment_type' => 'craftsman'])
            ->assertSessionHas('error', __('admin.brand_type_request.errors.nothing_changed'));

        $this->assertSame(0, ModerationRequest::query()->count());
    }

    public function test_changes_within_same_account_type_are_requested(): void
    {
        // Мастер: ремесленник → самозанятый.
        $this->submit(['type' => Brand::TYPE_MASTER, 'employment_type' => 'self_employed'])
            ->assertSessionHas('success');
        $this->pendingRequest()->update(['status' => ModerationRequest::STATUS_REJECTED]);

        $this->brand->update([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ]);

        // Бизнес: только УНП поправить — тоже заявкой.
        $this->submit($this->businessPayload(['employment_number' => '987654321']))
            ->assertSessionHas('success');

        $this->assertSame('987654321', $this->pendingRequest()->settings['requested']['employment_number']);
        $this->assertSame('123456789', $this->brand->refresh()->employment_number);
    }

    public function test_approval_applies_requested_values_and_notifies_owner(): void
    {
        $this->submit($this->businessPayload());
        $request = $this->pendingRequest();

        $this->actingAs($this->admin)
            ->post(route('admin.moderation.approve', $request))
            ->assertSessionHas('success');

        $this->brand->refresh();
        $this->assertSame(Brand::TYPE_BUSINESS, $this->brand->type);
        $this->assertSame('llc', $this->brand->employment_type);
        $this->assertSame('ООО «Ромашка»', $this->brand->employment_name);
        $this->assertSame('123456789', $this->brand->employment_number);
        $this->assertSame(ModerationRequest::STATUS_APPROVED, $request->refresh()->status);

        $this->assertTrue(EmailMessage::query()
            ->where('template_key', 'brand_type_request_reviewed_user')
            ->where('to_email', $this->manager->email)
            ->exists());
    }

    public function test_approval_to_master_clears_requisites(): void
    {
        $this->brand->update([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ]);

        $this->submit(['type' => Brand::TYPE_MASTER, 'employment_type' => 'self_employed']);

        $this->actingAs($this->admin)
            ->post(route('admin.moderation.approve', $this->pendingRequest()));

        $this->brand->refresh();
        $this->assertSame(Brand::TYPE_MASTER, $this->brand->type);
        $this->assertSame('self_employed', $this->brand->employment_type);
        $this->assertNull($this->brand->employment_name);
        $this->assertNull($this->brand->employment_number);
    }

    public function test_rejection_keeps_brand_and_shows_reason_in_settings(): void
    {
        $this->submit($this->businessPayload());
        $request = $this->pendingRequest();

        $this->actingAs($this->admin)
            ->post(route('admin.moderation.reject', $request), ['reason' => 'УНП не найден'])
            ->assertSessionHas('success');

        $this->assertSame(Brand::TYPE_MASTER, $this->brand->refresh()->type);

        $this->actingAs($this->manager)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('brandType.type', Brand::TYPE_MASTER)
                ->where('brandType.request.status', ModerationRequest::STATUS_REJECTED)
                ->where('brandType.request.reason', 'УНП не найден')
            );

        // После отказа можно подать заново.
        $this->submit($this->businessPayload())->assertSessionHas('success');
    }

    public function test_moderation_page_shows_requested_values(): void
    {
        $this->submit($this->businessPayload());

        $this->actingAs($this->admin)
            ->get(route('admin.moderation.show', $this->pendingRequest()))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ModerationShow', false)
                ->where('details.kind', 'brand_type')
                ->where('details.previous.type', Brand::TYPE_MASTER)
                ->where('details.requested.type', Brand::TYPE_BUSINESS)
                ->where('details.requested.employment_type_label', 'ООО')
                ->where('canReview', true)
            );
    }
}
