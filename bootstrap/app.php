<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Don't apply Inertia middleware globally - only for sb/admin routes
        // Filament has its own middleware stack
        $middleware->alias([
            'inertia' => \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        // Redirect unauthenticated users to appropriate login page
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('sb/admin/*') || $request->is('sb/admin')) {
                return route('sb.admin.login');
            }
            // For Filament and other routes, redirect to Filament login
            return '/admin/login';
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
