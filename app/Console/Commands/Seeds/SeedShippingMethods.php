<?php

namespace App\Console\Commands\Seeds;

use App\Models\Brand;
use App\Models\ShippingMethod;
use Illuminate\Console\Command;

class SeedShippingMethods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:shipping-methods {--force} {--assign-brands}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed shipping methods';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $force = (bool) $this->option('force');
        $assignBrands = (bool) $this->option('assign-brands');

        if ($force) {
            if (app()->isProduction() && !$this->confirm('This will delete all shipping methods and their brand associations. Continue?')) {
                return;
            }

            ShippingMethod::query()->delete();
        }

        foreach (ShippingMethod::DEFAULTS as $key => $name) {
            ShippingMethod::updateOrCreate(
                ['key' => $key],
                ['name' => $name]
            );
        }

        $this->info('Shipping methods seeded successfully.');

        if ($assignBrands) {
            $shippingMethodIds = ShippingMethod::pluck('id');
            $brands = Brand::all();

            foreach ($brands as $brand) {
                $brand->shippingMethods()->syncWithoutDetaching($shippingMethodIds);
            }

            $this->info("Assigned shipping methods to {$brands->count()} brand(s).");
        }
    }
}
