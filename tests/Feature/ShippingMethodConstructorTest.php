<?php

namespace Tests\Feature;

use App\Models\ShippingMethodConstructor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ShippingMethodConstructorTest extends TestCase
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

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function manager(): User
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        return $manager;
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Почтой по РБ',
            'description' => 'Доставка почтовой службой по Беларуси',
            'active' => true,
            'position' => 10,
            'merchant_fields' => ['shipping_price', 'delivery_time'],
            'customer_fields' => ['city', 'comments'],
        ], $overrides);
    }

    public function test_admin_can_create_constructor(): void
    {
        $response = $this->actingAs($this->admin())
            ->post(route('admin.settings.shipping-constructors.store'), $this->validPayload());

        $response->assertRedirect();

        $constructor = ShippingMethodConstructor::first();
        $this->assertNotNull($constructor);
        $this->assertSame('Почтой по РБ', $constructor->name);
        $this->assertTrue($constructor->active);
        $this->assertSame(
            ['shipping_price', 'delivery_time'],
            array_column($constructor->merchant_settings['fields'], 'key'),
        );
        // name/type собраны сервером из каталога
        $this->assertSame('Стоимость доставки', $constructor->merchant_settings['fields'][0]['name']);
        $this->assertSame('string', $constructor->merchant_settings['fields'][0]['type']);
        $this->assertSame(
            ['city', 'comments'],
            array_column($constructor->customer_settings['fields'], 'key'),
        );
    }

    public function test_admin_can_update_constructor(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $response = $this->actingAs($this->admin())
            ->put(
                route('admin.settings.shipping-constructors.update', $constructor),
                $this->validPayload([
                    'name' => 'Обновлённый способ',
                    'active' => false,
                    'merchant_fields' => ['pickup_points'],
                ]),
            );

        $response->assertRedirect();

        $constructor->refresh();
        $this->assertSame('Обновлённый способ', $constructor->name);
        $this->assertFalse($constructor->active);
        $this->assertSame(['pickup_points'], array_column($constructor->merchant_settings['fields'], 'key'));
    }

    public function test_admin_can_delete_constructor(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $this->actingAs($this->admin())
            ->delete(route('admin.settings.shipping-constructors.destroy', $constructor))
            ->assertRedirect();

        $this->assertDatabaseMissing('shipping_method_constructors', ['id' => $constructor->id]);
    }

    public function test_manager_cannot_manage_constructors(): void
    {
        $manager = $this->manager();
        $constructor = ShippingMethodConstructor::factory()->create();

        $this->actingAs($manager)
            ->post(route('admin.settings.shipping-constructors.store'), $this->validPayload())
            ->assertForbidden();

        $this->actingAs($manager)
            ->put(route('admin.settings.shipping-constructors.update', $constructor), $this->validPayload())
            ->assertForbidden();

        $this->actingAs($manager)
            ->delete(route('admin.settings.shipping-constructors.destroy', $constructor))
            ->assertForbidden();

        $this->assertDatabaseHas('shipping_method_constructors', ['id' => $constructor->id]);
        $this->assertSame(1, ShippingMethodConstructor::count());
    }

    public function test_settings_page_provides_constructors_and_catalogs_to_admin(): void
    {
        ShippingMethodConstructor::factory()->create();
        ShippingMethodConstructor::factory()->inactive()->create();

        $response = $this->actingAs($this->admin())->get(route('admin.settings'));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        // Админ видит все конструкторы (включая неактивные) и каталоги полей
        $this->assertCount(2, $props['allShippingConstructors']);
        $this->assertCount(
            count(ShippingMethodConstructor::MERCHANT_FIELDS),
            $props['merchantFieldsCatalog'],
        );
        $this->assertCount(
            count(ShippingMethodConstructor::CUSTOMER_FIELDS),
            $props['customerFieldsCatalog'],
        );
    }

    public function test_settings_page_provides_only_active_constructors_to_manager(): void
    {
        $active = ShippingMethodConstructor::factory()->create();
        ShippingMethodConstructor::factory()->inactive()->create();

        $manager = $this->manager();
        \App\Models\Brand::create(['user_id' => $manager->id, 'name' => 'Test Brand']);

        $response = $this->actingAs($manager)->get(route('admin.settings'));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        $this->assertCount(1, $props['shippingConstructors']);
        $this->assertSame($active->id, $props['shippingConstructors'][0]['id']);
        $this->assertArrayNotHasKey('allShippingConstructors', $props);
    }

    public function test_unknown_field_keys_are_rejected(): void
    {
        $response = $this->actingAs($this->admin())
            ->from('/admin/settings')
            ->post(
                route('admin.settings.shipping-constructors.store'),
                $this->validPayload(['merchant_fields' => ['unknown_key']]),
            );

        $response->assertSessionHasErrors('merchant_fields.0');
        $this->assertSame(0, ShippingMethodConstructor::count());
    }
}
