<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\BrandSettings;
use Illuminate\Database\Seeder;

class BrandSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $types = ['delivery', 'refund', 'phones', 'emails', 'socials', 'addresses'];

        Brand::all()->each(function ($brand) use ($types) {
            foreach ($types as $type) {
                BrandSettings::create([
                    'type' => $type,
                    'brand_id' => $brand->id,
                    'data' => [],
                ]);
            }
        });
    }
}
