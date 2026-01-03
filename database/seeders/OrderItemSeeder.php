<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        Order::all()->each(function ($order) {
            OrderItem::factory()->count(rand(1, 4))->create([
                'order_id' => $order->id,
            ]);
        });
    }
}
