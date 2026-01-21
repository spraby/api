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


        // API routes (JSON only, for TanStack Query)
        Route::get('/users/api', [App\Http\Controllers\Admin\UserController::class, 'apiIndex'])->name('users.api.index');
        Route::get('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiShow'])->name('users.api.show');
        Route::put('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiUpdate'])->name('users.api.update');
        Route::delete('/users/{id}/api', [App\Http\Controllers\Admin\UserController::class, 'apiDestroy'])->name('users.api.destroy');
        Route::post('/users/bulk-delete/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkDelete'])->name('users.api.bulk-delete');
        Route::post('/users/bulk-update-role/api', [App\Http\Controllers\Admin\UserController::class, 'apiBulkUpdateRole'])->name('users.api.bulk-update-role');


        Route::prefix('products')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products');

            Route::get('/create', [App\Http\Controllers\Admin\ProductController::class, 'create'])->name('products.create');
            Route::post('/store', [App\Http\Controllers\Admin\ProductController::class, 'store'])->name('products.store');

            // Bulk operations (Inertia)
            Route::post('/bulk-delete', [App\Http\Controllers\Admin\ProductController::class, 'bulkDestroy'])->name('products.bulk-delete');
            Route::post('/bulk-update-status', [App\Http\Controllers\Admin\ProductController::class, 'bulkUpdateStatus'])->name('products.bulk-update-status');

            Route::prefix('{product}')->group(function () {
                Route::get('/edit', [App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('products.edit');
                Route::put('/', [App\Http\Controllers\Admin\ProductController::class, 'update'])->name('products.update');
                Route::delete('/', [App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('products.destroy');

                Route::prefix('images')->group(function () {
                    Route::post('/attach', [App\Http\Controllers\Admin\ProductController::class, 'attachImages'])->name('products.images.attach');
                    Route::post('/upload', [App\Http\Controllers\Admin\ProductController::class, 'uploadImages'])->name('products.images.upload');
                    Route::delete('/{productImageId}', [App\Http\Controllers\Admin\ProductController::class, 'detachImage'])->name('products.images.detach');
                    Route::put('/reorder', [App\Http\Controllers\Admin\ProductController::class, 'reorderImages'])->name('products.images.reorder');
                });
            });

        });

        Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders');
        Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
        Route::put('/orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');

        // Brand Requests
        Route::get('/brand-requests', [App\Http\Controllers\Admin\BrandRequestController::class, 'index'])->name('brand-requests');
        Route::get('/brand-requests/{brandRequest}', [App\Http\Controllers\Admin\BrandRequestController::class, 'show'])->name('brand-requests.show');
        Route::post('/brand-requests/{brandRequest}/approve', [App\Http\Controllers\Admin\BrandRequestController::class, 'approve'])->name('brand-requests.approve');
        Route::post('/brand-requests/{brandRequest}/reject', [App\Http\Controllers\Admin\BrandRequestController::class, 'reject'])->name('brand-requests.reject');

        Route::prefix('media')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\MediaController::class, 'index'])->name('media');
            Route::get('/api', [App\Http\Controllers\Admin\MediaController::class, 'apiIndex'])->name('media.api.index');
            Route::delete('/{image}', [App\Http\Controllers\Admin\MediaController::class, 'destroy'])->name('media.destroy');
        });

        // Variant image management
        Route::put('/variants/{id}/image', [App\Http\Controllers\Admin\VariantController::class, 'setImage'])->name('variants.image.set');
        Route::put('/variants/{id}/image/api', [App\Http\Controllers\Admin\VariantController::class, 'apiSetImage'])->name('variants.api.image.set');

        Route::get('/categories/api', [App\Http\Controllers\Api\CategoryController::class, 'index'])->name('categories.api.index');

        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    });
});
