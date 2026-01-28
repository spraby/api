<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    /**
     * Start impersonating a user.
     */
    public function impersonate(User $user): RedirectResponse
    {
        $currentUser = Auth::user();

        // Only admins can impersonate
        if (! $currentUser->isAdmin()) {
            abort(403, 'Only administrators can impersonate users.');
        }

        // Cannot impersonate yourself
        if ($currentUser->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot impersonate yourself.');
        }

        // Cannot impersonate another admin
        if ($user->isAdmin()) {
            return redirect()->back()->with('error', 'You cannot impersonate another administrator.');
        }

        // Store the original admin ID in the session
        session()->put('impersonator_id', $currentUser->id);

        // Login as the target user
        Auth::login($user);

        return redirect()->route('admin.dashboard')
            ->with('success', "You are now impersonating {$user->first_name} {$user->last_name}.");
    }

    /**
     * Stop impersonating and return to the original admin account.
     */
    public function stopImpersonating(): RedirectResponse
    {
        $impersonatorId = session()->get('impersonator_id');

        if (! $impersonatorId) {
            return redirect()->route('admin.dashboard')
                ->with('error', 'You are not impersonating anyone.');
        }

        // Find the original admin user
        $originalUser = User::find($impersonatorId);

        if (! $originalUser) {
            session()->forget('impersonator_id');

            return redirect()->route('admin.dashboard')
                ->with('error', 'Original user not found.');
        }

        // Clear the impersonation session
        session()->forget('impersonator_id');

        // Login back as the original admin
        Auth::login($originalUser);

        return redirect()->route('admin.dashboard')
            ->with('success', 'You have stopped impersonating.');
    }
}