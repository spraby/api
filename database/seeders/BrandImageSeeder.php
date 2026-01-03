<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Image;
use Illuminate\Database\Seeder;

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
