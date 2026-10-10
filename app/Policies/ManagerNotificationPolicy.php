<?php

namespace App\Policies;

use App\Models\ManagerNotification;
use App\Models\User;

class ManagerNotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['READ_MANAGER_NOTIFICATIONS']);
    }

    public function view(User $user, ManagerNotification $notification): bool
    {
        return $this->viewAny($user);
    }

    /** Настройки (час, вкл/выкл) и ручная отправка. */
    public function update(User $user, ManagerNotification $notification): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['WRITE_MANAGER_NOTIFICATIONS']);
    }
}
