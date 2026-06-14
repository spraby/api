<?php

namespace App\Services;

use App\Models\PasswordSetupToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordSetupService
{
    /** Lifetime of a password-setup link, in hours. */
    public const TTL_HOURS = 48;

    /**
     * Issue a fresh one-time password-setup token for the user and return the
     * absolute URL to embed in the email. Any previously-issued unused tokens
     * for the user are invalidated.
     */
    public function generateUrl(User $user): string
    {
        PasswordSetupToken::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $plain = Str::random(64);

        PasswordSetupToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plain),
            'expires_at' => now()->addHours(self::TTL_HOURS),
        ]);

        return route('admin.password.setup.show', ['token' => $plain]);
    }

    /**
     * Resolve a plaintext token to a still-valid (unused, unexpired) record,
     * or null if it does not exist / has been used / has expired.
     */
    public function findValidToken(string $plain): ?PasswordSetupToken
    {
        $record = PasswordSetupToken::query()
            ->where('token', hash('sha256', $plain))
            ->first();

        return $record && $record->isValid() ? $record : null;
    }

    /**
     * Atomically consume a valid token and set the user's password. The row is
     * locked for the duration so two concurrent submissions cannot both succeed:
     * the loser sees the token already used and gets null. Returns the user on
     * success, or null if the token is missing / used / expired.
     */
    public function consumeAndSetPassword(string $plain, string $plainPassword): ?User
    {
        return DB::transaction(function () use ($plain, $plainPassword) {
            $record = PasswordSetupToken::query()
                ->where('token', hash('sha256', $plain))
                ->lockForUpdate()
                ->first();

            if (! $record || ! $record->isValid()) {
                return null;
            }

            $user = $record->user;
            $user->forceFill(['password' => Hash::make($plainPassword)])->save();
            $record->forceFill(['used_at' => now()])->save();

            return $user;
        });
    }
}
