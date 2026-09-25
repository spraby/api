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
 * Карточка «Тип аккаунта» на странице бренда у админа: форма занятости
 * зависит от типа, реквизиты (наименование и УНП) — только у бизнеса.
 */
class BrandEditEmploymentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['ADMIN'])->syncPermissions(array_values(User::PERMISSIONS));

        $this->admin = User::factory()->create();
        $this->admin->assignRole(User::ROLES['ADMIN']);

        $this->brand = Brand::create([
            'name' => 'Brand',
            'type' => Brand::TYPE_MASTER,
            'employment_type' => 'craftsman',
        ]);
    }

    private function update(array $payload)
    {
        return $this->actingAs($this->admin)
            ->put(route('admin.brands.update', $this->brand), [
                'name' => 'Brand',
                'description' => null,
                'category_ids' => [],
                ...$payload,
            ]);
    }

    public function test_edit_page_exposes_employment_types_by_type(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.brands.edit', $this->brand))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('employmentTypesByType.master', 2)
                ->has('employmentTypesByType.business', 3)
                ->where('brand.employment_name', null)
            );
    }

    public function test_admin_switches_to_business_with_requisites(): void
    {
        $this->update([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123 456 789',
        ])->assertSessionHasNoErrors();

        $this->brand->refresh();
        $this->assertSame(Brand::TYPE_BUSINESS, $this->brand->type);
        $this->assertSame('llc', $this->brand->employment_type);
        $this->assertSame('ООО «Ромашка»', $this->brand->employment_name);
        $this->assertSame('123456789', $this->brand->employment_number);
    }

    public function test_employment_type_must_match_account_type(): void
    {
        $this->update(['type' => Brand::TYPE_MASTER, 'employment_type' => 'llc'])
            ->assertSessionHasErrors('employment_type');

        $this->update(['type' => Brand::TYPE_BUSINESS, 'employment_type' => 'craftsman'])
            ->assertSessionHasErrors('employment_type');
    }

    public function test_business_unp_must_be_nine_digits(): void
    {
        $this->update([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_number' => '12345',
        ])->assertSessionHasErrors('employment_number');
    }

    public function test_switching_to_master_clears_requisites(): void
    {
        $this->brand->update([
            'type' => Brand::TYPE_BUSINESS,
            'employment_type' => 'llc',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ]);

        $this->update([
            'type' => Brand::TYPE_MASTER,
            'employment_type' => 'self_employed',
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ])->assertSessionHasNoErrors();

        $this->brand->refresh();
        $this->assertSame(Brand::TYPE_MASTER, $this->brand->type);
        $this->assertNull($this->brand->employment_name);
        $this->assertNull($this->brand->employment_number);
    }
}
