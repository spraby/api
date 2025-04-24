<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
//            BrandSeeder::class,
//            CategorySeeder::class,
//            OptionSeeder::class,
//            OptionValueSeeder::class,
//            ProductSeeder::class,
//            VariantSeeder::class,
//            VariantValueSeeder::class,
//            CustomerSeeder::class,
//            OrderSeeder::class,
//            OrderItemSeeder::class,
//            OrderShippingSeeder::class,
//            ImageSeeder::class,
//            ProductImageSeeder::class,
//            BrandImageSeeder::class,
//            SettingsSeeder::class,
//            BrandSettingsSeeder::class,
        ]);
    }
}
