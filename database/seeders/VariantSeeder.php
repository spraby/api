<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Variant;
use App\Models\Product;

class VariantSeeder extends Seeder
{
    public function run(): void
    {
        Product::all()->each(function ($product) {
            Variant::factory()->count(rand(2, 5))->create([
                'product_id' => $product->id,
            ]);
        });
    }
}
