<?php

namespace App\Policies;

use App\Models\CategoryRequest;
use App\Models\User;

class CategoryRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['READ_CATEGORY_REQUESTS']);
    }

    public function view(User $user, CategoryRequest $categoryRequest): bool
    {
        if (! $user->can(User::PERMISSIONS['READ_CATEGORY_REQUESTS'])) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $user->brands()->where('brands.id', $categoryRequest->brand_id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can(User::PERMISSIONS['WRITE_CATEGORY_REQUESTS'])
            && $user->getBrand() !== null;
    }

    public function update(User $user, CategoryRequest $categoryRequest): bool
    {
        return $user->isAdmin()
            && $user->can(User::PERMISSIONS['WRITE_CATEGORY_REQUESTS']);
    }
}
