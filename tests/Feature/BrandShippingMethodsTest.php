<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\ShippingMethod;
use App\Models\ShippingMethodConstructor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BrandShippingMethodsTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('manager')->syncPermissions(User::MANAGER_PERMISSIONS);
        Role::findOrCreate('admin')->syncPermissions(User::ADMIN_PERMISSIONS);

        $this->manager = User::factory()->create();
        $this->manager->assignRole('manager');
        $this->brand = Brand::create(['user_id' => $this->manager->id, 'name' => 'Test Brand']);
    }

    private function sync(array $methods)
    {
        return $this->actingAs($this->manager)
            ->put(route('admin.settings.shipping-methods.sync'), ['methods' => $methods]);
    }

    public function test_enabling_creates_method_with_field_snapshot_and_pivot(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $this->sync([
            [
                'constructor_id' => $constructor->id,
                'enabled' => true,
                'values' => [
                    'shipping_price' => '5.00',
                    'shipping_cities' => ['Минск', 'Гродно'],
                ],
            ],
        ])->assertRedirect();

        $method = $this->brand->shippingMethods()->first();
        $this->assertNotNull($method);
        $this->assertSame($constructor->id, $method->shipping_method_constructor_id);

        $merchant = collect($method->merchant_settings)->keyBy('key');
        $this->assertSame('5.00', $merchant['shipping_price']['value']);
        $this->assertSame(['Минск', 'Гродно'], $merchant['shipping_cities']['value']);
        // не заполненные поля получают пустое значение по типу
        $this->assertSame('', $merchant['delivery_time']['value']);

        // customer_settings — снапшот полей покупателя с пустыми значениями
        $customer = collect($method->customer_settings)->keyBy('key');
        $this->assertSame('', $customer['city']['value']);
    }

    public function test_updating_values_resnapshots_fields_from_constructor(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => ['shipping_price' => '5.00']],
        ]);

        // Админ изменил набор полей конструктора после включения брендом
        $constructor->update([
            'merchant_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::MERCHANT_FIELDS,
                ['shipping_price', 'merchant_notes'],
            ),
        ]);

        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => ['merchant_notes' => 'Звоните заранее']],
        ]);

        $this->assertSame(1, $this->brand->shippingMethods()->count());

        $method = $this->brand->shippingMethods()->first();
        $merchant = collect($method->merchant_settings)->keyBy('key');

        // re-snapshot: набор полей соответствует текущему конструктору
        $this->assertSame(['shipping_price', 'merchant_notes'], $merchant->keys()->all());
        // старое значение перенесено, новое записано
        $this->assertSame('5.00', $merchant['shipping_price']['value']);
        $this->assertSame('Звоните заранее', $merchant['merchant_notes']['value']);
    }

    public function test_disabling_deletes_method_and_pivot(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => []],
        ]);
        $methodId = $this->brand->shippingMethods()->first()->id;

        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => false, 'values' => []],
        ])->assertRedirect();

        $this->assertDatabaseMissing('shipping_methods', ['id' => $methodId]);
        $this->assertDatabaseMissing('brand_shipping_method', ['shipping_method_id' => $methodId]);
    }

    public function test_inactive_constructor_cannot_be_enabled_and_existing_records_survive(): void
    {
        $active = ShippingMethodConstructor::factory()->create();
        $this->sync([
            ['constructor_id' => $active->id, 'enabled' => true, 'values' => []],
        ]);

        // Деактивация конструктора не стирает запись бренда при следующем сохранении
        $active->update(['active' => false]);
        $this->sync([
            ['constructor_id' => $active->id, 'enabled' => false, 'values' => []],
        ]);
        $this->assertSame(1, $this->brand->shippingMethods()->count());

        // Включить неактивный конструктор нельзя
        $inactive = ShippingMethodConstructor::factory()->inactive()->create();
        $this->sync([
            ['constructor_id' => $inactive->id, 'enabled' => true, 'values' => []],
        ]);
        $this->assertSame(
            0,
            $this->brand->shippingMethods()->where('shipping_method_constructor_id', $inactive->id)->count(),
        );
    }

    public function test_invalid_merchant_values_are_rejected(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        // Числовое поле не принимает произвольный текст
        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => ['free_shipping_threshold' => 'не число']],
        ])->assertSessionHasErrors('methods');

        // Значения ограничены по длине — снапшот уходит в JSONB как есть
        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => ['shipping_price' => str_repeat('a', 2000)]],
        ])->assertSessionHasErrors('methods');

        $this->assertSame(0, $this->brand->shippingMethods()->count());
    }

    public function test_double_enable_does_not_duplicate_records(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();

        $payload = [['constructor_id' => $constructor->id, 'enabled' => true, 'values' => []]];
        $this->sync($payload);
        $this->sync($payload);

        $this->assertSame(1, ShippingMethod::count());
        $this->assertSame(1, $this->brand->shippingMethods()->count());
    }

    public function test_deleting_brand_removes_its_shipping_methods(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();
        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => []],
        ]);
        $methodId = $this->brand->shippingMethods()->first()->id;

        $this->brand->delete();

        $this->assertDatabaseMissing('shipping_methods', ['id' => $methodId]);
    }

    public function test_deleting_constructor_cascades_to_brand_methods(): void
    {
        $constructor = ShippingMethodConstructor::factory()->create();
        $this->sync([
            ['constructor_id' => $constructor->id, 'enabled' => true, 'values' => []],
        ]);
        $methodId = $this->brand->shippingMethods()->first()->id;

        $constructor->delete();

        $this->assertDatabaseMissing('shipping_methods', ['id' => $methodId]);
        $this->assertDatabaseMissing('brand_shipping_method', ['shipping_method_id' => $methodId]);
    }
}
