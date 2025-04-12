<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class Test extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->addPermissions();
    }

    public function addPermissions(){
//        Permission::create(['name' => 'manage_brands']);
        Role::findByName('admin')->givePermissionTo('manage_brands');
    }

    public function addRole(){
        $user = User::find(15);
        $user->assignRole('admin');
    }
}
