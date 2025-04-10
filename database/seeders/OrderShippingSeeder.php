<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderShipping;
use App\Models\Order;


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
