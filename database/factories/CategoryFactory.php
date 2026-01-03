<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = $this->faker->word();

        return [
            'handle' => Str::slug($name),
            'name' => ucfirst($name),
            'title' => ucfirst($name),
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}
