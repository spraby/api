<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Variant>
 */
class VariantFactory extends Factory
{
    protected $model = Variant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::inRandomOrder()->first()?->id,
            'title' => $this->faker->optional()->word(),
            'price' => $this->faker->randomFloat(2, 10, 300),
            'final_price' => $this->faker->randomFloat(2, 5, 250),
        ];
    }
}
