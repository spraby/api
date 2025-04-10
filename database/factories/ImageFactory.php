<?php

namespace Database\Factories;

use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Image>
 */
class ImageFactory extends Factory
{
    protected $model = Image::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'src' => $this->faker->imageUrl(640, 480, 'products', true),
            'alt' => $this->faker->optional()->words(2, true),
            'meta' => $this->faker->optional()->sentence(),
        ];
    }
}
