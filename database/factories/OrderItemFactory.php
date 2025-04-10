<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $variant = Variant::inRandomOrder()->first();
        $product = $variant?->product;

        return [
            'order_id' => Order::inRandomOrder()->first()?->id,
            'product_id' => $product?->id,
            'variant_id' => $variant?->id,
            'title' => $product?->title ?? 'Product',
            'variant_title' => $variant?->title ?? 'Default',
            'description' => $this->faker->optional()->sentence(),
            'quantity' => $this->faker->numberBetween(1, 5),
            'price' => $variant?->price ?? 0,
            'final_price' => $variant?->final_price ?? 0,
        ];
    }
}
