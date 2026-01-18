<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Order;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Show the orders list page with orders data.
     */
    public function index(): Response
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return Inertia::render('Orders', [
                'orders' => [],
                'error' => 'No brand associated with user',
            ]);
        }

        $orders = Order::with(['customer', 'orderItems'])
            ->where('brand_id', $brand->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'name' => $order->name,
                    'status' => $order->status,
                    'delivery_status' => $order->delivery_status,
                    'financial_status' => $order->financial_status,
                    'note' => $order->note,
                    'customer' => $order->customer ? [
                        'id' => $order->customer->id,
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                        'phone' => $order->customer->phone,
                    ] : null,
                    'items_count' => $order->orderItems->count(),
                    'total' => $order->orderItems->sum(function ($item) {
                        return (float) $item->final_price * $item->quantity;
                    }),
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

        return Inertia::render('Orders', [
            'orders' => $orders,
        ]);
    }
}
