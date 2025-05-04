<?php

namespace App\Console\Commands\Seeds;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SeedUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:users {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for generate default values';

    const PASS = '12qw34er';
    const ADMIN_EMAIL = 'admin@gmail.com';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $force = !!$this->option('force');
        $this->generateAdminsAndManagers($force);
    }

    /**
     * @return void
     */
    public function generateRoles(): void
    {
        $roles = ['admin', 'manager'];
        foreach ($roles as $roleValue) Role::findOrCreate($roleValue);
    }

    /**
     * @return void
     */
    private function generatePermissions(): void
    {
        foreach (User::PERMISSIONS as $PERMISSION) Permission::findOrCreate($PERMISSION);
    }

    /**
     * @return void
     */
    private function generateRolesAndPermissions(): void
    {
        $this->generateRoles();
        $this->generatePermissions();

        $roles = Role::get();

        foreach ($roles as $role) {
            if ($role->name === User::ROLES['ADMIN']) $role->syncPermissions(User::ADMIN_PERMISSIONS);
            if ($role->name === User::ROLES['MANAGER']) $role->syncPermissions(User::MANAGER_PERMISSIONS);
        }
    }

    /**
     * @return void
     */
    private function generateAdmin(): void
    {
        $user = User::admin()->first();

        if (!$user) {
            $user = User::factory()->create(['email' => self::ADMIN_EMAIL]);
            $user->assignRole(User::ROLES['ADMIN']);
        }
    }

    /**
     * @param int $count
     * @return void
     */
    private function generateManagers(int $count = 3): void
    {
        while ($count > 0) {
            $email = "manager{$count}@gmail.com";
            $user = User::manager()->email($email)->first();

            if (!$user) {
                $user = User::factory()->create(['email' => $email]);
                $user->assignRole(User::ROLES['MANAGER']);
            }
            $count--;
        }
    }

    /**
     * @param bool $force
     * @return void
     */
    private function generateAdminsAndManagers(bool $force = false): void
    {
        if ($force) {
            User::cursor()->each(function (User $user) {
                $user->delete();
            });
        }

        $this->generateRolesAndPermissions();
        $this->generateAdmin();
        $this->generateManagers();
    }
}
