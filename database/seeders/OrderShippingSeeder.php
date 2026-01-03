<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderShipping;
use Illuminate\Database\Seeder;

class OrderShippingSeeder extends Seeder
{
    public function run(): void
    {
        Order::all()->each(function ($order) {
            OrderShipping::factory()->create([
                'order_id' => $order->id,
            ]);
        });
    }
}
