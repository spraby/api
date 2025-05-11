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
        $force = !!$this->option('force');
        $this->generateBrands($force);
    }

    /**
     * @param bool $force
     * @return void
     */
    private function generateBrands(bool $force = false): void
    {
        if ($force) Brand::get()->each(function (Brand $brand) {
            $brand->delete();
        });

        User::manager()->cursor()->each(static function (User $user) {

            $categories = Category::inRandomOrder()->take(rand(1, 4))->get();

            $brand = Brand::updateOrCreate([
                'user_id' => $user->id,
                'name' => 'Brand_' . $user->id,
            ], [
                'description' => "Brand for user {$user->email}",
            ]);

            $brand->categories()->sync($categories->pluck('id'));
        });
    }
}
