<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    private const PERMISSIONS = [
        'read_moderation_requests',
        'write_moderation_requests',
    ];

    public function up(): void
    {
        foreach (self::PERMISSIONS as $name) {
            Permission::findOrCreate($name);
        }

        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo(self::PERMISSIONS);
        }
    }

    public function down(): void
    {
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->revokePermissionTo(self::PERMISSIONS);
        }

        Permission::whereIn('name', self::PERMISSIONS)->delete();
    }
};
