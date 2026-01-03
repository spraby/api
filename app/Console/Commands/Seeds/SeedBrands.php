<?php

namespace App\Console\Commands\Seeds;

use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Console\Command;

class SeedBrands extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:brands {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for generate default values';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $force = (bool) $this->option('force');
        $this->generateBrands($force);
    }

    private function generateBrands(bool $force = false): void
    {
        if ($force) {
            Brand::get()->each(function (Brand $brand) {
                $brand->delete();
            });
        }

        $users = User::get();
        $categories = Category::get();
        $categoriesPerUser = ceil($categories->count() / ($users->count() > 0 ? $users->count() : 1));
        $categories = $categories->chunk($categoriesPerUser);

        foreach ($users as $key => $user) {
            $index = isset($categories[$key]) ? $key : random_int(0, $users->count() - 1);
            $categoryIds = $categories[$index]->pluck('id');

            $brand = Brand::updateOrCreate([
                'user_id' => $user->id,
                'name' => 'Brand_'.$user->id,
            ], [
                'description' => "Brand for user {$user->email}",
            ]);
            $brand->categories()->sync($categoryIds);
        }
    }
}
