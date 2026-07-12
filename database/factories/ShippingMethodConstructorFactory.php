<?php

namespace Database\Factories;

use App\Models\ShippingMethodConstructor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShippingMethodConstructor>
 */
class ShippingMethodConstructorFactory extends Factory
{
    protected $model = ShippingMethodConstructor::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'active' => true,
            'position' => fake()->numberBetween(0, 100),
            'merchant_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::MERCHANT_FIELDS,
                ['shipping_price', 'free_shipping_threshold', 'shipping_cities', 'delivery_time'],
            ),
            'customer_settings' => ShippingMethodConstructor::buildFields(
                ShippingMethodConstructor::CUSTOMER_FIELDS,
                ['city', 'shipping_address', 'comments'],
            ),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }
}
