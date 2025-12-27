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

        Route::get('/users', function () {
            $users = \App\Models\User::with('roles')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'role' => $user->roles->first()?->name ?? null,
                        'created_at' => $user->created_at->toISOString(),
                    ];
                });

            return Inertia::render('Users', [
                'users' => $users
            ]);
        })->name('users');

        Route::post('/users/bulk-delete', function (Illuminate\Http\Request $request) {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id',
            ]);

            $userIds = $request->input('user_ids');

            // Prevent deleting yourself
            $currentUserId = auth()->id();
            $userIds = array_filter($userIds, fn($id) => $id != $currentUserId);

            \App\Models\User::whereIn('id', $userIds)->delete();

            return redirect()->back();
        })->name('users.bulk-delete');

        Route::post('/users/bulk-update-role', function (Illuminate\Http\Request $request) {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id',
                'role' => 'required|string|in:admin,manager',
            ]);

            $userIds = $request->input('user_ids');
            $roleName = $request->input('role');

            foreach ($userIds as $userId) {
                $user = \App\Models\User::find($userId);
                if ($user) {
                    // Remove all existing roles
                    $user->syncRoles([]);
                    // Assign new role
                    $user->assignRole($roleName);
                }
            }

            return redirect()->back();
        })->name('users.bulk-update-role');

        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    });
});
