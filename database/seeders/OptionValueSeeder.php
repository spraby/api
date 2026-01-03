<?php

namespace Database\Seeders;

use App\Models\OptionValue;
use Illuminate\Database\Seeder;

class OptionValueSeeder extends Seeder
{
    public function run(): void
    {
        OptionValue::factory()->count(30)->create();
    }
}
