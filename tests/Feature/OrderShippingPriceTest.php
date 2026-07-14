<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShipping;
use App\Models\ShippingMethod;
use App\Models\ShippingMethodConstructor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderShippingPriceTest extends TestCase
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

    private function makeOrder(Brand $brand, array $attributes = []): Order
    {
        $customer = Customer::factory()->create();

        $order = Order::create(array_merge([
            'name' => '#TEST-'.uniqid(),
            'customer_id' => $customer->id,
            'brand_id' => $brand->id,
        ], $attributes));

        // Две позиции: 2×10.00 + 1×5.00 = 25.00
        OrderItem::create([
            'order_id' => $order->id,
            'title' => 'Item A',
            'variant_title' => '',
            'quantity' => 2,
            'price' => '10.00',
            'final_price' => '10.00',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'title' => 'Item B',
            'variant_title' => '',
            'quantity' => 1,
            'price' => '5.00',
            'final_price' => '5.00',
        ]);

        return $order;
    }

    private function makeShippingMethod(
        string $name = 'Курьер',
        array $merchantFields = ['shipping_price'],
        array $merchantValues = ['shipping_price' => '7.50'],
        array $customerFields = ['city', 'shipping_address'],
    ): ShippingMethod {
        $constructor = ShippingMethodConstructor::create([
            'key' => 'test_method_'.uniqid(),
            'name' => $name,
            'active' => true,
            'position' => 1,
            'merchant_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::MERCHANT_FIELDS,
                $merchantFields,
            ),
            'customer_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::CUSTOMER_FIELDS,
                $customerFields,
            ),
        ]);
        $method = ShippingMethod::create([
            'shipping_method_constructor_id' => $constructor->id,
            'merchant_settings' => ShippingMethodConstructor::settingsWithValues(
                $constructor->merchant_settings['fields'],
                $merchantValues,
            ),
            'customer_settings' => ShippingMethodConstructor::settingsWithValues(
                $constructor->customer_settings['fields'],
                [],
            ),
        ]);
        $this->brand->shippingMethods()->attach($method->id);

        return $method;
    }

    public function test_manager_sets_shipping_price_and_total_recalculates(): void
    {
        $order = $this->makeOrder($this->brand);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.update-shipping-price', $order), ['shipping_price' => '5.50'])
            ->assertRedirect();

        $order->refresh();
        // subtotal берётся из позиций (старый заказ без снапшота)
        $this->assertSame('25.00', $order->subtotal);
        $this->assertSame('5.50', $order->shipping_price);
        $this->assertSame('30.50', $order->total);
    }

    public function test_clearing_shipping_price_keeps_total_without_shipping(): void
    {
        $order = $this->makeOrder($this->brand, [
            'subtotal' => '25.00',
            'shipping_price' => '5.50',
            'total' => '30.50',
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.update-shipping-price', $order), ['shipping_price' => null])
            ->assertRedirect();

        $order->refresh();
        $this->assertNull($order->shipping_price);
        $this->assertSame('25.00', $order->total);
    }

    public function test_rejects_negative_and_non_numeric_price(): void
    {
        $order = $this->makeOrder($this->brand);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.update-shipping-price', $order), ['shipping_price' => '-5'])
            ->assertSessionHasErrors('shipping_price');

        $this->actingAs($this->manager)
            ->put(route('admin.orders.update-shipping-price', $order), ['shipping_price' => 'дорого'])
            ->assertSessionHasErrors('shipping_price');

        $this->assertNull($order->refresh()->shipping_price);
    }

    public function test_foreign_brand_order_is_not_updated(): void
    {
        $otherManager = User::factory()->create();
        $otherManager->assignRole('manager');
        $otherBrand = Brand::create(['user_id' => $otherManager->id, 'name' => 'Other Brand']);
        $order = $this->makeOrder($otherBrand);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.update-shipping-price', $order), ['shipping_price' => '5.50'])
            ->assertRedirect(route('admin.orders'));

        $this->assertNull($order->refresh()->shipping_price);
    }

    public function test_updating_shipping_details_writes_order_audit(): void
    {
        $order = $this->makeOrder($this->brand);
        $method = $this->makeShippingMethod();
        $shipping = OrderShipping::create([
            'order_id' => $order->id,
            'name' => 'Old Recipient',
            'phone' => '111',
            'note' => '',
            'shipping_method_name' => 'Старый способ',
            'customer_settings' => [
                ['key' => 'city', 'name' => 'Город', 'type' => 'string', 'value' => 'Минск'],
                ['key' => 'shipping_address', 'name' => 'Адрес доставки', 'type' => 'string', 'value' => 'Старый адрес'],
            ],
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $shipping->id,
                        'name' => 'New Recipient',
                        'phone' => '222',
                        'note' => 'Позвонить заранее',
                        'shipping_method_id' => $method->id,
                        'customer_settings' => [
                            ['key' => 'city', 'name' => 'Город', 'type' => 'string', 'value' => 'Гомель'],
                            ['key' => 'shipping_address', 'name' => 'Адрес доставки', 'type' => 'string', 'value' => 'Новый адрес'],
                            ['key' => 'extra', 'name' => 'Лишнее', 'type' => 'string', 'value' => 'Не сохранять'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        // Одно действие менеджера — одна запись истории: пересчёт цены
        // не должен порождать отдельный авто-аудит Order::updated.
        $this->assertSame(1, $order->audits()->where('event', 'updated')->count());

        $audit = $order->audits()
            ->where('message', 'Изменена информация о доставке')
            ->latest()
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('Old Recipient', $audit->old_values['shipping_name']);
        $this->assertSame('New Recipient', $audit->new_values['shipping_name']);
        $this->assertSame('Старый способ', $audit->old_values['shipping_method_name']);
        $this->assertSame('Курьер', $audit->new_values['shipping_method_name']);
        $this->assertSame('Минск', $audit->old_values['shipping_field:city:Город']);
        $this->assertSame('Гомель', $audit->new_values['shipping_field:city:Город']);
        $this->assertArrayNotHasKey('shipping_field:extra:Лишнее', $audit->new_values);
        $this->assertSame('7.50', $audit->new_values['shipping_price']);
        $this->assertSame('32.50', $audit->new_values['total']);

        $order->refresh();
        $this->assertSame('7.50', $order->shipping_price);
        $this->assertSame('32.50', $order->total);
    }

    public function test_shipping_customer_settings_keep_existing_snapshot_shape(): void
    {
        $order = $this->makeOrder($this->brand);
        $shipping = OrderShipping::create([
            'order_id' => $order->id,
            'name' => 'Recipient',
            'phone' => '111',
            'note' => '',
            'shipping_method_name' => 'Курьер',
            'customer_settings' => [
                ['key' => 'city', 'name' => 'Город', 'type' => 'string', 'value' => 'Минск'],
            ],
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $shipping->id,
                        'name' => 'Recipient',
                        'phone' => '111',
                        'note' => '',
                        'shipping_method_id' => null,
                        'customer_settings' => [
                            ['key' => 'city', 'name' => 'Подменённый город', 'type' => 'string', 'value' => 'Гомель'],
                            ['key' => 'extra', 'name' => 'Лишнее', 'type' => 'string', 'value' => 'Не сохранять'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $settings = collect($shipping->refresh()->customer_settings);
        $this->assertSame(['city'], $settings->pluck('key')->all());
        $this->assertSame('Город', $settings->first()['name']);
        $this->assertSame('Гомель', $settings->first()['value']);

        $audit = $order->audits()
            ->where('message', 'Изменена информация о доставке')
            ->latest()
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('Гомель', $audit->new_values['shipping_field:city:Город']);
        $this->assertArrayNotHasKey('shipping_field:extra:Лишнее', $audit->new_values);
    }

    public function test_shipping_method_price_rules_are_explicit(): void
    {
        $order = $this->makeOrder($this->brand);
        $freeMethod = $this->makeShippingMethod(
            name: 'Самовывоз',
            merchantFields: [],
            merchantValues: [],
            customerFields: ['pickup_point'],
        );
        $negotiatedMethod = $this->makeShippingMethod(
            name: 'Доставка по договорённости',
            merchantFields: ['shipping_price'],
            merchantValues: ['shipping_price' => ''],
            customerFields: ['shipping_address'],
        );
        $shipping = OrderShipping::create([
            'order_id' => $order->id,
            'name' => 'Recipient',
            'phone' => '111',
            'note' => '',
            'shipping_method_name' => 'Старый способ',
            'customer_settings' => [
                ['key' => 'shipping_address', 'name' => 'Адрес доставки', 'type' => 'string', 'value' => 'Минск'],
            ],
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $shipping->id,
                        'name' => 'Recipient',
                        'phone' => '111',
                        'note' => '',
                        'shipping_method_id' => $freeMethod->id,
                        'customer_settings' => [
                            ['key' => 'pickup_point', 'name' => 'Пункт самовывоза', 'type' => 'string', 'value' => 'ТЦ Замок'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $order->refresh();
        $this->assertSame('0.00', $order->shipping_price);
        $this->assertSame('25.00', $order->total);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $shipping->refresh()->id,
                        'name' => 'Recipient',
                        'phone' => '111',
                        'note' => '',
                        'shipping_method_id' => $negotiatedMethod->id,
                        'customer_settings' => [
                            ['key' => 'shipping_address', 'name' => 'Адрес доставки', 'type' => 'string', 'value' => 'Гомель'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $order->refresh();
        $this->assertNull($order->shipping_price);
        $this->assertSame('25.00', $order->total);
    }

    public function test_shipping_method_price_with_comma_decimal_is_applied(): void
    {
        $order = $this->makeOrder($this->brand);
        $method = $this->makeShippingMethod(
            name: 'Курьер (ru-локаль)',
            merchantValues: ['shipping_price' => '7,50'],
        );
        $shipping = OrderShipping::create([
            'order_id' => $order->id,
            'name' => 'Recipient',
            'phone' => '111',
            'note' => '',
            'shipping_method_name' => 'Старый способ',
            'customer_settings' => [
                ['key' => 'city', 'name' => 'Город', 'type' => 'string', 'value' => 'Минск'],
            ],
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $shipping->id,
                        'name' => 'Recipient',
                        'phone' => '111',
                        'note' => '',
                        'shipping_method_id' => $method->id,
                        'customer_settings' => [
                            ['key' => 'city', 'name' => 'Город', 'type' => 'string', 'value' => 'Минск'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $order->refresh();
        $this->assertSame('7.50', $order->shipping_price);
        $this->assertSame('32.50', $order->total);
    }

    public function test_shipping_of_another_order_is_rejected(): void
    {
        $order = $this->makeOrder($this->brand);
        $otherOrder = $this->makeOrder($this->brand);
        $foreignShipping = OrderShipping::create([
            'order_id' => $otherOrder->id,
            'name' => 'Recipient',
            'phone' => '111',
            'note' => '',
            'shipping_method_name' => 'Курьер',
            'customer_settings' => [],
        ]);

        $this->actingAs($this->manager)
            ->put(route('admin.orders.shippings.update', $order), [
                'shippings' => [
                    [
                        'id' => $foreignShipping->id,
                        'name' => 'Hacked',
                        'phone' => '111',
                        'note' => '',
                        'shipping_method_id' => null,
                        'customer_settings' => [],
                    ],
                ],
            ])
            ->assertSessionHasErrors('shippings.0.id');

        $this->assertSame('Recipient', $foreignShipping->refresh()->name);
    }
}
