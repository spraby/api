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
 * Реквизиты (наименование бизнеса и УНП) в «Настройки → Основные» —
 * только для просмотра: их, как и форму занятости, меняют заявкой.
 */
class SettingsRequisitesTest extends TestCase
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

    private function brandOfType(string $type): Brand
    {
        $manager = User::factory()->create();
        $manager->assignRole(User::ROLES['MANAGER']);

        return Brand::create([
            'user_id' => $manager->id,
            'name' => 'Brand',
            'type' => $type,
            'employment_type' => 'llc',
        ]);
    }

    private function saveGeneral(Brand $brand, array $payload)
    {
        return $this->actingAs($brand->user)
            ->put(route('admin.settings.general.update'), [
                'about' => null,
                'refund_policy' => null,
                'image_id' => null,
                ...$payload,
            ]);
    }

    public function test_business_requisites_cannot_be_changed_from_settings(): void
    {
        $brand = $this->brandOfType(Brand::TYPE_BUSINESS);
        $brand->update(['employment_name' => 'ООО «Ромашка»', 'employment_number' => '123456789']);

        // Реквизиты меняются только заявкой — из настроек их не принимаем.
        $this->saveGeneral($brand, [
            'employment_name' => 'ООО «Лютик»',
            'employment_number' => '987654321',
        ])->assertSessionHasNoErrors();

        $brand->refresh();
        $this->assertSame('ООО «Ромашка»', $brand->employment_name);
        $this->assertSame('123456789', $brand->employment_number);
    }

    public function test_master_requisites_are_ignored(): void
    {
        $brand = $this->brandOfType(Brand::TYPE_MASTER);

        $this->saveGeneral($brand, [
            'employment_name' => 'ООО «Ромашка»',
            'employment_number' => '123456789',
        ])->assertSessionHasNoErrors();

        $brand->refresh();
        $this->assertNull($brand->employment_name);
        $this->assertNull($brand->employment_number);
    }

    public function test_employment_type_cannot_be_changed_from_settings(): void
    {
        $brand = $this->brandOfType(Brand::TYPE_BUSINESS);

        $this->saveGeneral($brand, ['employment_type' => 'craftsman'])
            ->assertSessionHasNoErrors();

        $this->assertSame('llc', $brand->refresh()->employment_type);
    }

    public function test_settings_page_exposes_requisites_only_for_business(): void
    {
        $brand = $this->brandOfType(Brand::TYPE_BUSINESS);

        $this->actingAs($brand->user)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('isBusiness', true)
                ->where('employmentTypeLabel', 'ООО')
            );

        $master = $this->brandOfType(Brand::TYPE_MASTER);

        $this->actingAs($master->user)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('isBusiness', false));
    }
}
