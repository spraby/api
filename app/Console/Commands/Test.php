<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
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
        $order = Order::first();
        $order->status = 'confirmed';
        $order->save();

        dd();

        /**
         * @var Product $product
         */
        $product = Product::find(11);

        dd($product->images->first());

        $d = Storage::disk('s3')->put('test.txt', 'Hello, S3!');
        dd($d);
$image = Image::find(2);
dd(Storage::disk('public')->url($image->src));
        dd();

        $user = User::create([
            'first_name' => 'admin',
            'last_name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('12qw34er'), // используй надёжный пароль
        ]);

        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole('admin');

//        $this->addPermissions();
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
