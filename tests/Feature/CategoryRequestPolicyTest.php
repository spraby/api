<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CategoryRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CategoryRequestPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('manager')->syncPermissions(User::MANAGER_PERMISSIONS);
        Role::findOrCreate('admin')->syncPermissions(User::ADMIN_PERMISSIONS);
    }

    public function test_manager_can_view_own_brand_request(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $brand = Brand::create(['user_id' => $manager->id, 'name' => 'A']);

        $request = CategoryRequest::create([
            'brand_id' => $brand->id,
            'user_id' => $manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
            'comment' => 'mine',
        ]);

        $this->assertTrue($manager->can('view', $request));
    }

    public function test_manager_cannot_view_other_brand_request(): void
    {
        $managerA = User::factory()->create();
        $managerA->assignRole('manager');
        $brandA = Brand::create(['user_id' => $managerA->id, 'name' => 'A']);

        $managerB = User::factory()->create();
        $managerB->assignRole('manager');
        $brandB = Brand::create(['user_id' => $managerB->id, 'name' => 'B']);

        $requestB = CategoryRequest::create([
            'brand_id' => $brandB->id,
            'user_id' => $managerB->id,
            'status' => CategoryRequest::STATUS_PENDING,
            'comment' => 'not yours',
        ]);

        $this->assertFalse($managerA->can('view', $requestB));
    }

    public function test_admin_can_view_any_request_and_update(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $someManager = User::factory()->create();
        $someManager->assignRole('manager');
        $brand = Brand::create(['user_id' => $someManager->id, 'name' => 'X']);

        $request = CategoryRequest::create([
            'brand_id' => $brand->id,
            'user_id' => $someManager->id,
            'status' => CategoryRequest::STATUS_PENDING,
            'comment' => 'any',
        ]);

        $this->assertTrue($admin->can('view', $request));
        $this->assertTrue($admin->can('update', $request));
    }

    public function test_manager_cannot_update_request(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $brand = Brand::create(['user_id' => $manager->id, 'name' => 'A']);

        $request = CategoryRequest::create([
            'brand_id' => $brand->id,
            'user_id' => $manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
            'comment' => 'mine',
        ]);

        $this->assertFalse($manager->can('update', $request));
    }
}
