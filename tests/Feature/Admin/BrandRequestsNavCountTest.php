<?php

namespace Tests\Feature\Admin;

use App\Models\BrandRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** Бейдж у пункта меню «Заявки»: сколько заявок продавцов ждут решения. */
class BrandRequestsNavCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_menu_shows_pending_brand_requests_count(): void
    {
        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['ADMIN'])->syncPermissions(array_values(User::PERMISSIONS));

        $admin = User::factory()->create();
        $admin->assignRole(User::ROLES['ADMIN']);

        BrandRequest::create(['email' => 'a@example.com', 'status' => BrandRequest::STATUS_PENDING]);
        BrandRequest::create(['email' => 'b@example.com', 'status' => BrandRequest::STATUS_PENDING]);
        BrandRequest::create(['email' => 'c@example.com', 'status' => BrandRequest::STATUS_APPROVED]);

        $this->actingAs($admin)
            ->get(route('admin.brand-requests'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('navCounts.brand_requests', 2));
    }
}
