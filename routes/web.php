<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Foundation\Application;
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

// Vue Admin routes - all under /sb/admin prefix
Route::prefix('sb/admin')->name('sb.admin.')->middleware(['inertia'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('sb.admin.login'),
            'canRegister' => Route::has('sb.admin.register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });

    Route::middleware(['auth', 'verified'])->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        // Products
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('Admin/Products/Index');
            })->name('index');
            Route::get('/create', function () {
                return Inertia::render('Admin/Products/Create');
            })->name('create');
        });

        // Categories
        Route::get('/categories', function () {
            return Inertia::render('Admin/Categories/Index');
        })->name('categories.index');

        // Collections
        Route::get('/collections', function () {
            return Inertia::render('Admin/Collections/Index');
        })->name('collections.index');

        // Orders
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('Admin/Orders/Index');
            })->name('index');
            Route::get('/pending', function () {
                return Inertia::render('Admin/Orders/Pending');
            })->name('pending');
            Route::get('/completed', function () {
                return Inertia::render('Admin/Orders/Completed');
            })->name('completed');
        });

        // Customers
        Route::get('/customers', function () {
            return Inertia::render('Admin/Customers/Index');
        })->name('customers.index');

        // Brands
        Route::get('/brands', function () {
            return Inertia::render('Admin/Brands/Index');
        })->name('brands.index');

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/general', function () {
                return Inertia::render('Admin/Settings/General');
            })->name('general');
            Route::get('/brands', function () {
                return Inertia::render('Admin/Settings/Brands');
            })->name('brands');
            Route::get('/users', function () {
                return Inertia::render('Admin/Settings/Users');
            })->name('users');
        });

        // Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // API Routes (JSON responses)
        Route::prefix('api')->name('api.')->group(function () {
            // Brands
            Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
            Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');
            Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
            Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
            Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

            // Products
            Route::get('/products', [ProductController::class, 'index'])->name('products.index');
            Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
            Route::post('/products', [ProductController::class, 'store'])->name('products.store');
            Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

            // Categories (simple list)
            Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        });
    });

    require __DIR__.'/auth.php';
});
