<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'brand_id' => Brand::inRandomOrder()->first()?->id,
            'category_id' => Category::inRandomOrder()->first()?->id,
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->optional()->paragraph(),
            'enabled' => $this->faker->boolean(90),
            'price' => $this->faker->randomFloat(2, 10, 300),
            'final_price' => $this->faker->randomFloat(2, 5, 250),
        ];
    }
}
