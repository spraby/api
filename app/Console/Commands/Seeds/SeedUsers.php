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
    protected $signature = 'seed:users {--force} {--email=} {--password=} {--role=manager}';

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
        $force = (bool) $this->option('force');
        $email = $this->option('email');

        if ($email) {
            $password = $this->option('password') ?? $this->secret('Password');
            $role = $this->option('role');
            $this->generateRolesAndPermissions();
            $this->generateUser($email, $password, $role);
            return;
        }

        $this->generateAdminsAndManagers($force);
    }

    public function generateRoles(): void
    {
        $roles = ['admin', 'manager'];
        foreach ($roles as $roleValue) {
            Role::findOrCreate($roleValue);
        }
    }

    private function generatePermissions(): void
    {
        foreach (User::PERMISSIONS as $PERMISSION) {
            Permission::findOrCreate($PERMISSION);
        }
    }

    private function generateRolesAndPermissions(): void
    {
        $this->generateRoles();
        $this->generatePermissions();

        $roles = Role::get();

        foreach ($roles as $role) {
            if ($role->name === User::ROLES['ADMIN']) {
                $role->syncPermissions(User::ADMIN_PERMISSIONS);
            }
            if ($role->name === User::ROLES['MANAGER']) {
                $role->syncPermissions(User::MANAGER_PERMISSIONS);
            }
        }
    }

    private function generateUser(?string $email = null, ?string $password = null, string $role = 'admin'): void
    {
        $userEmail = $email ?? self::ADMIN_EMAIL;
        $user = User::where('email', $userEmail)->first();

        if (! $user) {
            $data = ['email' => $userEmail];
            if ($password) {
                $data['password'] = bcrypt($password);
            }
            $user = User::factory()->create($data);
            $user->assignRole($role);
            $this->info("{$role} created: {$userEmail}");
        } else {
            $this->info("User already exists: {$userEmail}");
        }
    }

    private function generateManagers(int $count = 15): void
    {
        while ($count > 0) {
            $email = "manager{$count}@gmail.com";
            $user = User::manager()->email($email)->first();

            if (! $user) {
                $user = User::factory()->create(['email' => $email]);
                $user->assignRole(User::ROLES['MANAGER']);
            }
            $count--;
        }
    }

    private function generateAdminsAndManagers(bool $force = false): void
    {
        if ($force) {
            User::cursor()->each(function (User $user) {
                $user->delete();
            });
        }

        $this->generateRolesAndPermissions();
        $this->generateUser(self::ADMIN_EMAIL, null, User::ROLES['ADMIN']);
        $this->generateManagers();
    }
}
