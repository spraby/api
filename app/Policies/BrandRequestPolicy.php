<?php

namespace App\Policies;

use App\Models\BrandRequest;
use App\Models\User;

class BrandRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only admins can access brand requests.
     */
    public function viewAny(User $user): bool
    {
        return $user->can(User::PERMISSIONS['READ_BRAND_REQUESTS']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BrandRequest $brandRequest): bool
    {
        return $user->can(User::PERMISSIONS['READ_BRAND_REQUESTS']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_BRAND_REQUESTS']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BrandRequest $brandRequest): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_BRAND_REQUESTS']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BrandRequest $brandRequest): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_BRAND_REQUESTS']);
    }
}