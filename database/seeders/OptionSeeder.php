<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Option;
use App\Models\Category;

class OptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = Option::factory()->count(6)->create();

        $categories = Category::all();

        foreach ($categories as $category) {
            $category->options()->attach(
                $options->random(rand(1, 3))->pluck('id')
            );
        }
    }
}
