<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
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
}
