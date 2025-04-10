<?php

namespace Database\Factories;

use App\Models\ProductImage;
use App\Models\Product;
use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::inRandomOrder()->first()?->id,
            'image_id' => Image::inRandomOrder()->first()?->id,
            'position' => $this->faker->numberBetween(0, 10),
        ];
    }
}
