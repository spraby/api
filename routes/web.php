<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Original route - keep for compatibility
Route::get('/', function () {
    return view('welcome');
});

// Language switcher - restore original functionality
Route::get('/set-locale/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'ru'])) {
        session()->put('locale', $locale);
    }

    return redirect()->back();
})->name('set-locale');

// React Admin routes with Inertia
Route::prefix('sb/admin')->name('sb.admin.')->middleware('inertia')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', function () {
            return Inertia::render('Auth/Login');
        })->name('login');

        Route::get('/register', function () {
            return Inertia::render('Auth/Register');
        })->name('register');

        Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
        Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);
    });

    Route::middleware('auth')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');

        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        });

        // Inertia routes (page rendering only)
        Route::get('/users', function () {
            return Inertia::render('Users');
        })->name('users');
        Route::get('/users/{id}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');

        // API routes (JSON only, for TanStack Query)
        Route::get('/users/api', [App\Http\Controllers\Admin\UserController::class, 'apiIndex'])->name('users.api.index');
        Route::get('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiShow'])->name('users.api.show');
        Route::put('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiUpdate'])->name('users.api.update');
        Route::delete('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiDestroy'])->name('users.api.destroy');
        Route::post('/users/bulk-delete/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkDelete'])->name('users.api.bulk-delete');
        Route::post('/users/bulk-update-role/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkUpdateRole'])->name('users.api.bulk-update-role');

        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    });
});
