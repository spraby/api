<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Brand>
 */
class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition(): array
    {
        return [
            'user_id' => User::query()->where('role', 'manager')->inRandomOrder()->first()?->id,
            'name' => $this->faker->company(),
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}
