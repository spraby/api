<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderShipping;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderShipping>
 */
class OrderShippingFactory extends Factory
{
    protected $model = OrderShipping::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::inRandomOrder()->first()?->id,
            'name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'note' => $this->faker->optional()->sentence(),
        ];
    }
}
