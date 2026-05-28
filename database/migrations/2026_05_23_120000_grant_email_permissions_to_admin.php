<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['read_emails', 'write_emails'] as $name) {
            Permission::findOrCreate($name);
        }

        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo(['read_emails', 'write_emails']);
        }
    }

    public function down(): void
    {
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->revokePermissionTo(['read_emails', 'write_emails']);
        }

        Permission::whereIn('name', ['read_emails', 'write_emails'])->delete();
    }
};
