<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::with('roles')
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
    }

    /**
     * Bulk delete users.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'required|integer|exists:users,id',
        ]);

        $userIds = $request->input('user_ids');

        // Prevent deleting yourself
        $currentUserId = auth()->id();
        $userIds = array_filter($userIds, fn($id) => $id != $currentUserId);

        User::whereIn('id', $userIds)->delete();

        return redirect()->back();
    }

    /**
     * Bulk update user roles.
     */
    public function bulkUpdateRole(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'required|integer|exists:users,id',
            'role' => 'required|string|in:admin,manager',
        ]);

        $userIds = $request->input('user_ids');
        $roleName = $request->input('role');

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                // Remove all existing roles
                $user->syncRoles([]);
                // Assign new role
                $user->assignRole($roleName);
            }
        }

        return redirect()->back();
    }
}