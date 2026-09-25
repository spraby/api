<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Мастер не продаёт через площадку: у него нет раздела заказов
 * и аналитики продаж. Бизнес-бренд видит всё как раньше.
 */
class MasterBrandSalesAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['MANAGER'])->syncPermissions(User::MANAGER_PERMISSIONS);
    }

    private function managerWithBrand(string $type): User
    {
        $manager = User::factory()->create();
        $manager->assignRole(User::ROLES['MANAGER']);
        Brand::create(['user_id' => $manager->id, 'name' => 'Brand', 'type' => $type]);

        return $manager;
    }

    public function test_master_is_redirected_from_orders(): void
    {
        $this->actingAs($this->managerWithBrand(Brand::TYPE_MASTER))
            ->get(route('admin.orders'))
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_business_can_open_orders(): void
    {
        $this->actingAs($this->managerWithBrand(Brand::TYPE_BUSINESS))
            ->get(route('admin.orders'))
            ->assertOk();
    }

    public function test_master_dashboard_has_no_sales_analytics(): void
    {
        $this->actingAs($this->managerWithBrand(Brand::TYPE_MASTER))
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard', false)
                ->where('auth.user.has_sales_access', false)
                ->where('sales_enabled', false)
                ->where('brand_account.type', Brand::TYPE_MASTER)
                ->where('brand_account.has_pending_request', false)
                ->where('top_products', [])
                ->has('metrics.clicks')
            );
    }

    public function test_business_dashboard_keeps_sales_analytics(): void
    {
        $this->actingAs($this->managerWithBrand(Brand::TYPE_BUSINESS))
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard', false)
                ->where('auth.user.has_sales_access', true)
                ->where('sales_enabled', true)
                ->where('brand_account.type', Brand::TYPE_BUSINESS)
            );
    }
}
