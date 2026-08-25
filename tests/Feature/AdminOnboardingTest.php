<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CategoryRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminOnboardingTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(User::ROLES['MANAGER']);

        $this->manager = User::factory()->create();
        $this->manager->assignRole(User::ROLES['MANAGER']);
        $this->brand = Brand::create([
            'user_id' => $this->manager->id,
            'name' => 'Onboarding Brand',
        ]);
    }

    public function test_dashboard_shows_required_category_step_to_new_manager(): void
    {
        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard', false)
                ->where('onboarding.visible', true)
                ->where('onboarding.can_dismiss', false)
                ->where('onboarding.progress.completed', 0)
                ->where('onboarding.progress.current_step', 'categories')
                ->where('onboarding.steps.categories.status', 'not_submitted')
                ->where('onboarding.steps.product.blocked', true)
            );
    }

    public function test_pending_category_request_completes_required_submission_step(): void
    {
        CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.can_dismiss', false)
                ->where('onboarding.progress.completed', 1)
                ->where('onboarding.progress.current_step', 'settings')
                ->where('onboarding.steps.categories.status', 'pending')
            );
    }

    public function test_menu_hint_can_be_closed_without_completing_required_step(): void
    {
        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), [
                'action' => 'hide_hint',
                'step' => 'categories',
            ])
            ->assertOk()
            ->assertJsonPath('onboarding.hidden_hints.0', 'categories')
            ->assertJsonPath('onboarding.steps.categories.completed', false);

        $this->assertSame(
            ['categories'],
            $this->manager->refresh()->onboarding_hidden_hints,
        );
    }

    public function test_closing_hints_only_resolves_optional_settings(): void
    {
        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), [
                'action' => 'hide_hint',
                'step' => 'settings',
            ])
            ->assertOk()
            ->assertJsonPath('onboarding.steps.settings.completed', true)
            ->assertJsonPath('onboarding.steps.settings.resolved_count', 4);

        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), [
                'action' => 'hide_hint',
                'step' => 'product',
            ])
            ->assertOk()
            ->assertJsonPath('onboarding.steps.product.completed', false);

        $manager = $this->manager->refresh();

        $this->assertEqualsCanonicalizing([
            'settings.general',
            'settings.addresses',
            'settings.delivery',
            'settings.contacts',
        ], $manager->onboarding_skipped_steps);
        $this->assertEqualsCanonicalizing([
            'settings',
            'product',
        ], $manager->onboarding_hidden_hints);
    }

    public function test_legacy_product_skip_does_not_complete_product_step(): void
    {
        $this->manager->update([
            'onboarding_skipped_steps' => ['product'],
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.steps.product.completed', false)
                ->where('onboarding.progress.current_step', 'categories')
            );
    }

    public function test_product_step_only_completes_after_product_is_published(): void
    {
        $product = Product::create([
            'brand_id' => $this->brand->id,
            'title' => 'First product',
            'enabled' => false,
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.steps.product.completed', false)
            );

        $product->update(['enabled' => true]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.steps.product.completed', true)
            );
    }

    public function test_onboarding_is_shared_outside_dashboard_for_menu_hints(): void
    {
        $this->actingAs($this->manager)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.visible', true)
                ->where('onboarding.progress.current_step', 'categories')
            );
    }

    public function test_tutorial_cannot_be_dismissed_before_category_request(): void
    {
        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), ['action' => 'dismiss'])
            ->assertOk()
            ->assertJsonPath('onboarding.visible', true)
            ->assertJsonPath('onboarding.can_dismiss', false);

        $this->assertNull($this->manager->refresh()->onboarding_dismissed_at);
    }

    public function test_tutorial_can_be_dismissed_after_all_steps_are_completed(): void
    {
        CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);

        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), [
                'action' => 'hide_hint',
                'step' => 'settings',
            ])
            ->assertOk();

        $this->brand->products()->create([
            'title' => 'Published product',
            'enabled' => true,
        ]);

        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), ['action' => 'dismiss'])
            ->assertOk()
            ->assertJsonPath('onboarding.visible', false)
            ->assertJsonPath('onboarding.can_dismiss', true);

        $this->assertNotNull($this->manager->refresh()->onboarding_dismissed_at);
    }

    public function test_rejected_request_keeps_required_reminder_active(): void
    {
        CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_REJECTED,
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.can_dismiss', false)
                ->where('onboarding.steps.categories.completed', false)
                ->where('onboarding.steps.categories.status', 'rejected')
            );
    }

    public function test_rejected_request_keeps_step_incomplete_even_with_attached_categories(): void
    {
        $category = \App\Models\Category::factory()->create();
        $this->brand->categories()->attach($category->id);

        CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_REJECTED,
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.steps.categories.completed', false)
                ->where('onboarding.steps.categories.status', 'rejected')
                ->where('onboarding.progress.current_step', 'categories')
            );
    }

    public function test_dismissed_tutorial_stays_hidden_after_completeness_regresses(): void
    {
        CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);
        $product = $this->brand->products()->create([
            'title' => 'Published product',
            'enabled' => true,
        ]);
        $this->manager->forceFill([
            'onboarding_skipped_steps' => [
                'settings.general',
                'settings.addresses',
                'settings.delivery',
                'settings.contacts',
            ],
            'onboarding_dismissed_at' => now(),
        ])->save();

        // Регресс завершённости: единственный опубликованный товар снят с публикации.
        $product->update(['enabled' => false]);

        // Скрытый туториал не воскресает (onboarding в middleware отдаёт null без запросов).
        $this->actingAs($this->manager)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding', null)
            );
    }

    public function test_hiding_settings_hint_preserves_foreign_skipped_steps(): void
    {
        $this->manager->forceFill([
            'onboarding_skipped_steps' => ['product'],
        ])->save();

        $this->actingAs($this->manager)
            ->putJson(route('admin.onboarding.update'), [
                'action' => 'hide_hint',
                'step' => 'settings',
            ])
            ->assertOk();

        $this->assertEqualsCanonicalizing([
            'product',
            'settings.general',
            'settings.addresses',
            'settings.delivery',
            'settings.contacts',
        ], $this->manager->refresh()->onboarding_skipped_steps);
    }
}
