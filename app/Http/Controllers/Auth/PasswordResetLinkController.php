<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

use function Illuminate\Support\defer;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Queue a password reset link for the given email.
     *
     * The response is the same whether or not the account exists, so the form
     * cannot be used to probe which emails are registered. Accounts without a
     * password yet (approved managers who have not used their setup link) are
     * skipped: they get back in through the admin-issued setup link instead.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        // Runs after the response is sent: the lookup, token hashing and
        // queueing take measurably longer for a real account, and doing them
        // inline would let response timing reveal which emails are registered.
        $email = $validated['email'];
        defer(function () use ($email) {
            $user = User::query()->where('email', $email)->first();

            if ($user && $user->password !== null) {
                // RESET_THROTTLED is deliberately swallowed too — reporting it
                // would reveal that the account exists.
                Password::sendResetLink(['email' => $user->email]);
            }
        });

        return back()->with(
            'status',
            'Если аккаунт с таким email существует, мы отправили на него ссылку для смены пароля.'
        );
    }
}
