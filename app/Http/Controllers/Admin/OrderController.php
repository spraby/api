<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    /**
     * Show the order detail page.
     */
    public function show(Order $order): Response|RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        // Verify ownership
        if (!$brand || $order->brand_id !== $brand->id) {
            return redirect()->route('admin.orders');
        }

        // Load relationships
        $order->load([
            'customer',
            'orderItems.product',
            'orderItems.variant',
            'orderItems.image.image',
            'orderShippings',
        ]);

        // Load audits with user
        $audits = $order->audits()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'event' => $audit->event,
                    'message' => $audit->message,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'user' => $audit->user ? [
                        'id' => $audit->user->id,
                        'name' => $audit->user->name,
                        'email' => $audit->user->email,
                    ] : null,
                    'created_at' => $audit->created_at->toISOString(),
                ];
            });

        // Map order data
        $orderData = [
            'id' => $order->id,
            'name' => $order->name,
            'status' => $order->status,
            'delivery_status' => $order->delivery_status,
            'financial_status' => $order->financial_status,
            'note' => $order->note,
            'status_url' => $order->status_url,
            'created_at' => $order->created_at->toISOString(),
            'updated_at' => $order->updated_at->toISOString(),
            'customer' => $order->customer ? [
                'id' => $order->customer->id,
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'phone' => $order->customer->phone,
            ] : null,
            'order_items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'variant_title' => $item->variant_title,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'price' => (string) $item->price,
                    'final_price' => (string) $item->final_price,
                    'image_url' => $item->image?->image?->url,
                ];
            }),
            'order_shippings' => $order->orderShippings->map(function ($shipping) {
                return [
                    'id' => $shipping->id,
                    'name' => $shipping->name,
                    'phone' => $shipping->phone,
                    'note' => $shipping->note,
                ];
            }),
        ];

        return Inertia::render('OrderShow', [
            'order' => $orderData,
            'audits' => $audits,
        ]);
    }

    /**
     * Update order status fields.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        // Verify ownership
        if (!$brand || $order->brand_id !== $brand->id) {
            return redirect()->route('admin.orders');
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,processing,completed,cancelled,archived',
            'delivery_status' => 'sometimes|in:pending,packing,shipped,transit,delivered',
            'financial_status' => 'sometimes|in:unpaid,paid,partial_paid,refunded',
        ]);

        $order->update($validated);

        return redirect()->back();
    }
}
