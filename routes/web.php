<?php

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

    });

    require __DIR__.'/auth.php';
});
