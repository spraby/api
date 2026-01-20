<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['admin', 'manager'];

        foreach ($roles as $roleValue) {
            Role::findOrCreate($roleValue);
        }

        // Create all permissions from User model
        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        // Assign permissions to roles
        $adminRole = Role::findByName('admin');
        $adminRole->syncPermissions(User::ADMIN_PERMISSIONS);

        $managerRole = Role::findByName('manager');
        $managerRole->syncPermissions(User::MANAGER_PERMISSIONS);

        /**
         * @var User $user
         */
        $user = User::where('email', 'admin@gmail.com')->first();
        if (! $user) {
            $user = User::factory()->admin()->create([
                'email' => 'admin@gmail.com',
            ]);
        }
        $user->assignRole('admin');

        $user = User::where('email', 'manager@gmail.com')->first();
        if (! $user) {
            $user = User::factory()->create([
                'email' => 'manager@gmail.com',
            ]);
        }

        $user->assignRole('manager');

        User::factory()->count(3)->create();
    }
}
