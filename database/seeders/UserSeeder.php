<?php

namespace Database\Seeders;

//use App\Models\Permission;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{

    const PERMISSIONS = [
        'READ_PRODUCTS' => 'read_products',
        'WRITE_PRODUCTS' => 'write_products',
        'READ_CATEGORY' => 'read_category',
        'WRITE_CATEGORY' => 'write_category',
    ];

    const MANAGER_PERMISSIONS = [
        self::PERMISSIONS['READ_PRODUCTS'],
        self::PERMISSIONS['WRITE_PRODUCTS'],
        self::PERMISSIONS['READ_CATEGORY'],
        self::PERMISSIONS['WRITE_CATEGORY'],
    ];


    public function run(): void
    {
        $roles = ['admin', 'manager'];

        foreach ($roles as $roleValue) Role::findOrCreate($roleValue);
        foreach (self::PERMISSIONS as $PERMISSION) Permission::findOrCreate($PERMISSION);


        foreach ($roles as $roleValue) {
            $role = Role::findByName($roleValue);
            $role->syncPermissions(self::MANAGER_PERMISSIONS);
        }

        /**
         * @var User $user
         */
        $user = User::where('email', 'admin@gmail.com')->first();
        if(!$user){
            User::factory()->admin()->create([
                'email' => 'admin@gmail.com',
            ]);
        }
        $user->assignRole('admin');


        $user = User::where('email', 'manager@gmail.com')->first();
        if(!$user){
            $user = User::factory()->create([
                'email' => 'manager@gmail.com',
            ]);
        }

        $user->assignRole('manager');

        User::factory()->count(3)->create();
    }
}
