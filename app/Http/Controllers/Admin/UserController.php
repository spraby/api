<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
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

    /**
     * Show the form for editing the specified user.
     */
    public function edit(int $id): Response
    {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('UserEdit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? null,
            ]
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, int $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validated();

            // Update user basic info
            $user->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
            ]);

            // Update role if provided
            if (isset($validated['role'])) {
                if ($validated['role'] === '') {
                    // Remove all roles
                    $user->syncRoles([]);
                } else {
                    // Sync to new role
                    $user->syncRoles([$validated['role']]);
                }
            } else {
                // If role is not in request, remove all roles
                $user->syncRoles([]);
            }

            return redirect()
                ->back()
                ->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }
}
