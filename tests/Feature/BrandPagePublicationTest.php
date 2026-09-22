<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\BrandPageController;
use App\Models\Brand;
use App\Models\ModerationRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BrandPagePublicationTest extends TestCase
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
            'name' => 'My Page Brand',
        ]);
    }

    /** Данные подтверждения, как их шлёт окно публикации. */
    private function consent(): array
    {
        return [
            'accepted' => true,
            'terms_version' => BrandPageController::TERMS_VERSION,
            'terms_text' => 'Подтверждаю, что уполномочен публиковать страницу бренда.',
        ];
    }

    public function test_my_page_shows_brand_page_state_to_manager(): void
    {
        $this->actingAs($this->manager)
            ->get(route('admin.my-page'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('MyPage', false)
                ->where('brand.name', 'My Page Brand')
                ->where('brandPage.page_status', Brand::PAGE_STATUS_NONE)
                ->where('brandPage.request', null)
                ->where('termsVersion', BrandPageController::TERMS_VERSION)
                ->where('termsUrl', rtrim((string) config('app.store_url'), '/').'/brand-page-terms')
            );
    }

    public function test_request_creates_moderation_request_and_stores_consent(): void
    {
        $this->actingAs($this->manager)
            ->post(route('admin.my-page.request'), $this->consent())
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(Brand::PAGE_STATUS_PENDING, $this->brand->refresh()->page_status);

        $request = ModerationRequest::query()
            ->where('type', ModerationRequest::TYPE_BRAND_PAGE)
            ->firstOrFail();

        $this->assertSame(ModerationRequest::STATUS_PENDING, $request->status);
        $this->assertSame(BrandPageController::TERMS_VERSION, $request->settings['terms']['version']);
        $this->assertSame($this->manager->id, $request->settings['terms']['user_id']);
        $this->assertNotEmpty($request->settings['terms']['accepted_at']);
    }

    public function test_request_without_consent_is_rejected(): void
    {
        $this->actingAs($this->manager)
            ->post(route('admin.my-page.request'), [...$this->consent(), 'accepted' => false])
            ->assertSessionHasErrors('accepted');

        $this->assertSame(Brand::PAGE_STATUS_NONE, $this->brand->refresh()->page_status);
        $this->assertDatabaseCount('moderation_requests', 0);
    }

    public function test_second_request_does_not_duplicate_pending_one(): void
    {
        $this->actingAs($this->manager)
            ->post(route('admin.my-page.request'), $this->consent())
            ->assertRedirect();

        $this->actingAs($this->manager)
            ->post(route('admin.my-page.request'), $this->consent())
            ->assertRedirect()
            ->assertSessionHas('error', __('admin.my_page.errors.already_requested'));

        $this->assertDatabaseCount('moderation_requests', 1);
    }

    public function test_published_brand_cannot_request_publication_again(): void
    {
        $this->brand->update([
            'page_status' => Brand::PAGE_STATUS_PUBLISHED,
            'page_published_at' => now(),
        ]);

        $this->actingAs($this->manager)
            ->post(route('admin.my-page.request'), $this->consent())
            ->assertRedirect()
            ->assertSessionHas('error', __('admin.my_page.errors.already_published'));

        $this->assertDatabaseCount('moderation_requests', 0);
    }
}
