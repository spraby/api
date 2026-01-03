<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the form for editing the specified user.
     * Data is fetched via API using TanStack Query
     */
    public function edit(int $id): Response
    {
        return Inertia::render('UserEdit', [
            'userId' => $id,
        ]);
    }

    // ========================================
    // API ENDPOINTS (для TanStack Query)
    // ========================================

    /**
     * API: Get all users as JSON
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $query = User::with('roles')->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $role = $request->input('role');
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        $users = $query->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? null,
                'created_at' => $user->created_at->toISOString(),
            ];
        });

        return response()->json($users);
    }

    /**
     * API: Get single user as JSON
     */
    public function apiShow(int $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->roles->first()?->name ?? null,
            'created_at' => $user->created_at->toISOString(),
        ]);
    }

    /**
     * API: Update user and return JSON
     */
    public function apiUpdate(UpdateUserRequest $request, int $id): JsonResponse
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
                    $user->syncRoles([]);
                } else {
                    $user->syncRoles([$validated['role']]);
                }
            } else {
                $user->syncRoles([]);
            }

            // Reload to get updated data
            $user->load('roles');

            return response()->json([
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? null,
                'created_at' => $user->created_at->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Delete user and return JSON
     */
    public function apiDestroy(int $id): JsonResponse
    {
        try {
            // Prevent deleting yourself
            if ($id == auth()->id()) {
                return response()->json([
                    'message' => 'Cannot delete yourself',
                ], 403);
            }

            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Bulk delete users and return JSON
     */
    public function apiBulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'required|integer|exists:users,id',
        ]);

        $userIds = $request->input('user_ids');

        // Prevent deleting yourself
        $currentUserId = auth()->id();
        $userIds = array_filter($userIds, fn ($id) => $id != $currentUserId);

        User::whereIn('id', $userIds)->delete();

        return response()->json([
            'message' => 'Users deleted successfully',
        ]);
    }

    /**
     * API: Bulk update user roles and return JSON
     */
    public function apiBulkUpdateRole(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'User roles updated successfully',
        ]);
    }
}
