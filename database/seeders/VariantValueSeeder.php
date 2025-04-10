<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Variant;
use App\Models\Option;
use App\Models\OptionValue;
use App\Models\VariantValue;

class VariantValueSeeder extends Seeder
{
    public function run(): void
    {
        Variant::all()->each(function ($variant) {
            $options = Option::inRandomOrder()->take(rand(1, 3))->get();

            foreach ($options as $option) {
                $value = OptionValue::where('option_id', $option->id)->inRandomOrder()->first();

                if ($value) {
                    VariantValue::create([
                        'variant_id' => $variant->id,
                        'option_id' => $option->id,
                        'option_value_id' => $value->id,
                    ]);
                }
            }
        });
    }
}
