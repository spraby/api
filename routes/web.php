<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect to admin panel
Route::get('/', function () {
    return redirect('/sb/admin');
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

        Route::get('/products', function () {
            return Inertia::render('Products');
        })->name('products');
        Route::get('/products/{id}/edit', [App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('products.edit');

        Route::get('/media', [App\Http\Controllers\Admin\MediaController::class, 'index'])->name('media');

        // API routes (JSON only, for TanStack Query)
        Route::get('/users/api', [App\Http\Controllers\Admin\UserController::class, 'apiIndex'])->name('users.api.index');
        Route::get('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiShow'])->name('users.api.show');
        Route::put('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiUpdate'])->name('users.api.update');
        Route::delete('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiDestroy'])->name('users.api.destroy');
        Route::post('/users/bulk-delete/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkDelete'])->name('users.api.bulk-delete');
        Route::post('/users/bulk-update-role/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkUpdateRole'])->name('users.api.bulk-update-role');

        Route::get('/products/api', [App\Http\Controllers\Admin\ProductController::class, 'apiIndex'])->name('products.api.index');
        Route::get('/products/{id}/api', [App\Http\Controllers\Admin\ProductController::class, 'apiShow'])->name('products.api.show');
        Route::put('/products/{id}/api', [App\Http\Controllers\Admin\ProductController::class, 'apiUpdate'])->name('products.api.update');
        Route::delete('/products/{id}/api', [App\Http\Controllers\Admin\ProductController::class, 'apiDestroy'])->name('products.api.destroy');
        Route::post('/products/bulk-delete/api', [App\Http\Controllers\Admin\ProductController::class, 'apiBulkDelete'])->name('products.api.bulk-delete');
        Route::post('/products/bulk-update-status/api', [App\Http\Controllers\Admin\ProductController::class, 'apiBulkUpdateStatus'])->name('products.api.bulk-update-status');

        // Product images management
        Route::post('/products/{id}/images/attach/api', [App\Http\Controllers\Admin\ProductController::class, 'apiAttachImages'])->name('products.api.images.attach');
        Route::post('/products/{id}/images/upload/api', [App\Http\Controllers\Admin\ProductController::class, 'apiUploadImages'])->name('products.api.images.upload');
        Route::delete('/products/{id}/images/{productImageId}/api', [App\Http\Controllers\Admin\ProductController::class, 'apiDetachImage'])->name('products.api.images.detach');
        Route::put('/products/{id}/images/reorder/api', [App\Http\Controllers\Admin\ProductController::class, 'apiReorderImages'])->name('products.api.images.reorder');

        // Variant image management
        Route::put('/variants/{id}/image/api', [App\Http\Controllers\Admin\VariantController::class, 'apiSetImage'])->name('variants.api.image.set');

        Route::get('/categories/api', [App\Http\Controllers\Api\CategoryController::class, 'index'])->name('categories.api.index');

        Route::get('/media/api', [App\Http\Controllers\Admin\MediaController::class, 'apiIndex'])->name('media.api.index');
        Route::delete('/media/{image}', [App\Http\Controllers\Admin\MediaController::class, 'destroy'])->name('media.destroy');

        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    });
});
