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

        Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users');
        Route::get('/users/{id}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
        Route::post('/users/bulk-delete', [App\Http\Controllers\Admin\UserController::class, 'bulkDelete'])->name('users.bulk-delete');
        Route::post('/users/bulk-update-role', [App\Http\Controllers\Admin\UserController::class, 'bulkUpdateRole'])->name('users.bulk-update-role');

        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    });
});
