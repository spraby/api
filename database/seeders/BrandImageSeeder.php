<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Image;

class BrandImageSeeder extends Seeder
{
    public function run(): void
    {
        Brand::all()->each(function ($brand) {
            $imageIds = Image::inRandomOrder()->take(rand(1, 3))->pluck('id');
            $brand->images()->attach($imageIds);
        });
    }
}
