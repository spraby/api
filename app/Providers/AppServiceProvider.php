<?php

namespace App\Providers;

use App\Filament\Components\Copyable;
use App\Models\ProductImage;
use App\Observers\ProductImageObserver;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Blade::component('copyable', Copyable::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        FilamentAsset::register([
            Css::make('fancybox-style', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css')->loadedOnRequest(),
            Js::make('fancybox-script', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js')->loadedOnRequest(),
            Js::make('fancybox-loader', asset('js/custom/fancyapps-loader.js'))->loadedOnRequest(),
        ]);

        ProductImage::observe(ProductImageObserver::class);
    }
}
