<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'name' => 'ORD-'.$this->faker->unique()->numerify('###-###'),
            'customer_id' => Customer::inRandomOrder()->first()?->id,
            'brand_id' => Brand::inRandomOrder()->first()?->id,
            'note' => $this->faker->optional()->sentence(),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived']),
            'delivery_status' => $this->faker->randomElement(['pending', 'packing', 'shipped', 'transit', 'delivered']),
            'financial_status' => $this->faker->randomElement(['unpaid', 'paid', 'partial_paid', 'refunded']),
        ];
    }
}
