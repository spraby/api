<?php

namespace Database\Factories;

use App\Models\Option;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Option>
 */
class OptionFactory extends Factory
{
    protected $model = Option::class;

    public function definition(): array
    {
        $name = $this->faker->word();
        return [
            'name' => $name,
            'title' => ucfirst($name),
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}
