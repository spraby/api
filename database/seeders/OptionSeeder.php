<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Option;
use Illuminate\Database\Seeder;

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
