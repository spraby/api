<?php

namespace Database\Factories;

use App\Models\Option;
use App\Models\OptionValue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OptionValue>
 */
class OptionValueFactory extends Factory
{
    protected $model = OptionValue::class;

    public function definition(): array
    {
        return [
            'option_id' => Option::inRandomOrder()->first()?->id,
            'value' => $this->faker->unique()->word(),
        ];
    }
}
