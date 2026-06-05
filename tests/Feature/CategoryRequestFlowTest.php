<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CategoryRequest;
use App\Models\CategoryRequestItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CategoryRequestFlowTest extends TestCase
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

        $managerRole = Role::findOrCreate('manager');
        $managerRole->syncPermissions(User::MANAGER_PERMISSIONS);

        $adminRole = Role::findOrCreate('admin');
        $adminRole->syncPermissions(User::ADMIN_PERMISSIONS);

        $this->manager = User::factory()->create();
        $this->manager->assignRole('manager');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->brand = Brand::create([
            'user_id' => $this->manager->id,
            'name' => 'Test Brand',
        ]);
    }

    public function test_manager_creates_request_with_multiple_categories(): void
    {
        $categories = Category::factory()->count(3)->create();

        $response = $this->actingAs($this->manager)->post('/admin/my-categories/requests', [
            'category_ids' => $categories->pluck('id')->all(),
        ]);

        $response->assertRedirect();

        $this->assertDatabaseCount('category_requests', 1);
        $this->assertDatabaseCount('category_request_items', 3);

        $request = CategoryRequest::query()->first();
        $this->assertEquals($this->brand->id, $request->brand_id);
        $this->assertEquals($this->manager->id, $request->user_id);
        $this->assertEquals(CategoryRequest::STATUS_PENDING, $request->status);
    }

    public function test_admin_partial_approve_sets_status_partial(): void
    {
        $categories = Category::factory()->count(3)->create();

        $request = CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);

        foreach ($categories as $category) {
            $request->items()->create([
                'category_id' => $category->id,
                'status' => CategoryRequestItem::STATUS_PENDING,
            ]);
        }

        $items = $request->items()->get();

        $this->actingAs($this->admin)
            ->post("/admin/category-requests/{$request->id}/approve", [
                'item_ids' => [$items[0]->id, $items[1]->id],
            ])
            ->assertRedirect();

        $this->actingAs($this->admin)
            ->post("/admin/category-requests/{$request->id}/reject", [
                'item_ids' => [$items[2]->id],
                'rejection_reason' => 'Not relevant',
            ])
            ->assertRedirect();

        $request->refresh();
        $this->assertEquals(CategoryRequest::STATUS_PARTIAL, $request->status);

        $attached = $this->brand->categories()->pluck('categories.id')->all();
        $this->assertContains($categories[0]->id, $attached);
        $this->assertContains($categories[1]->id, $attached);
        $this->assertNotContains($categories[2]->id, $attached);
    }

    public function test_full_approve_sets_status_approved(): void
    {
        $categories = Category::factory()->count(2)->create();

        $request = CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);

        foreach ($categories as $category) {
            $request->items()->create([
                'category_id' => $category->id,
                'status' => CategoryRequestItem::STATUS_PENDING,
            ]);
        }

        $itemIds = $request->items()->pluck('id')->all();

        $this->actingAs($this->admin)
            ->post("/admin/category-requests/{$request->id}/approve", [
                'item_ids' => $itemIds,
            ]);

        $request->refresh();
        $this->assertEquals(CategoryRequest::STATUS_APPROVED, $request->status);
        $this->assertNotNull($request->reviewed_at);
        $this->assertEquals($this->admin->id, $request->reviewed_by);
    }

    public function test_full_reject_sets_status_rejected(): void
    {
        $categories = Category::factory()->count(2)->create();

        $request = CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);

        foreach ($categories as $category) {
            $request->items()->create([
                'category_id' => $category->id,
                'status' => CategoryRequestItem::STATUS_PENDING,
            ]);
        }

        $itemIds = $request->items()->pluck('id')->all();

        $this->actingAs($this->admin)
            ->post("/admin/category-requests/{$request->id}/reject", [
                'item_ids' => $itemIds,
                'rejection_reason' => 'No reason',
            ]);

        $request->refresh();
        $this->assertEquals(CategoryRequest::STATUS_REJECTED, $request->status);
        $this->assertCount(0, $this->brand->categories()->get());
    }

    public function test_cannot_request_already_attached_category(): void
    {
        $category = Category::factory()->create();
        $this->brand->categories()->attach($category->id);

        $response = $this->actingAs($this->manager)->post('/admin/my-categories/requests', [
            'category_ids' => [$category->id],
        ]);

        $response->assertSessionHasErrors('category_ids');
        $this->assertDatabaseCount('category_requests', 0);
    }

    public function test_cannot_request_category_with_pending_item(): void
    {
        $category = Category::factory()->create();

        $existing = CategoryRequest::create([
            'brand_id' => $this->brand->id,
            'user_id' => $this->manager->id,
            'status' => CategoryRequest::STATUS_PENDING,
        ]);
        $existing->items()->create([
            'category_id' => $category->id,
            'status' => CategoryRequestItem::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->manager)->post('/admin/my-categories/requests', [
            'category_ids' => [$category->id],
        ]);

        $response->assertSessionHasErrors('category_ids');
    }
}
