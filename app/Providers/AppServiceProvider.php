<?php

namespace App\Providers;

use App\Services\Contracts\FileServiceInterface;
use App\Services\FileService;
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
    }
}
