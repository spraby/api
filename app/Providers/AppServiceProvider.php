<?php

namespace App\Providers;

use App\Models\BrandRequest;
use App\Models\CategoryRequest;
use App\Models\Order;
use App\Observers\BrandRequestObserver;
use App\Observers\CategoryRequestObserver;
use App\Observers\OrderObserver;
use App\Services\Contracts\FileServiceInterface;
use App\Services\FileService;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register FileService as singleton
        $this->app->singleton(FileServiceInterface::class, FileService::class);
        $this->app->singleton(FileService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        JsonResource::withoutWrapping();

        BrandRequest::observe(BrandRequestObserver::class);
        CategoryRequest::observe(CategoryRequestObserver::class);
        Order::observe(OrderObserver::class);
    }
}
