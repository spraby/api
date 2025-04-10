<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\BrandSettings;

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
