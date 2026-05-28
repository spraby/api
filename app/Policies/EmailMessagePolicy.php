<?php

namespace App\Policies;

use App\Models\EmailMessage;
use App\Models\User;

class EmailMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(User::PERMISSIONS['READ_EMAILS']);
    }

    public function view(User $user, EmailMessage $emailMessage): bool
    {
        return $user->can(User::PERMISSIONS['READ_EMAILS']);
    }

    public function update(User $user, EmailMessage $emailMessage): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_EMAILS']);
    }

    public function delete(User $user, EmailMessage $emailMessage): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_EMAILS']);
    }
}
