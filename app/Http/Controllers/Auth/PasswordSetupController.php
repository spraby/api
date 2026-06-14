<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\BrandRequestNotifier;
use App\Services\PasswordSetupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PasswordSetupController extends Controller
{
    public function __construct(
        protected PasswordSetupService $service,
        protected BrandRequestNotifier $notifier,
    ) {}

    /**
     * Render the "set your password" page for a token. The page renders an
     * invalid state when the token is missing, used or expired, rather than
     * leaking whether a token ever existed.
     */
    public function show(string $token): Response
    {
        $record = $this->service->findValidToken($token);

        return Inertia::render('Auth/SetPassword', [
            'token' => $token,
            'email' => $record?->user->email,
            'valid' => (bool) $record,
        ]);
    }

    /**
     * Set the user's password from a valid token, mark the token used, log the
     * user in and send them to the dashboard.
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        // Validate before touching the token so a bad password does not burn it.
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $this->service->consumeAndSetPassword($token, $validated['password']);

        if (! $user) {
            return redirect()->route('admin.password.setup.show', ['token' => $token]);
        }

        // Let admins know the seller activated their account and is ready to work.
        $this->notifier->notifyPasswordSet($user);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard')
            ->with('success', 'Пароль установлен. Добро пожаловать!');
    }
}
