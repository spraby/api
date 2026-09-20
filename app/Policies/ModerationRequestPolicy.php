<?php

namespace App\Policies;

use App\Models\ModerationRequest;
use App\Models\User;

class ModerationRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['READ_MODERATION_REQUESTS']);
    }

    public function view(User $user, ModerationRequest $moderationRequest): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, ModerationRequest $moderationRequest): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['WRITE_MODERATION_REQUESTS']);
    }
}
