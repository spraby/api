<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\EmailQueue;

class OrderObserver
{
    public function __construct(protected EmailQueue $queue) {}

    public function created(Order $order): void
    {
        $customer = $order->customer;
        $brand = $order->brand;

        $payload = [
            'order_id' => $order->id,
            'order_number' => $order->name ?? $order->id,
            'customer_name' => $customer?->name,
            'customer_email' => $customer?->email,
            'customer_phone' => $customer?->phone,
            'brand_name' => $brand?->name,
            'status' => $order->status,
            'status_url' => $order->status_url,
        ];

        if (! empty($customer?->email)) {
            $this->queue->enqueue(
                templateKey: 'order_created_user',
                toEmail: $customer->email,
                subject: 'Заказ #'.($order->name ?? $order->id).' принят',
                payload: $payload,
                options: ['to_name' => $customer->name, 'source_model' => $order],
            );
        }

        $admins = $this->queue->adminRecipients();
        if (! empty($admins)) {
            $this->queue->enqueueMany(
                templateKey: 'order_created_admin',
                recipients: $admins,
                subject: 'Новый заказ #'.($order->name ?? $order->id),
                payload: array_merge($payload, [
                    'admin_url' => rtrim(config('app.url'), '/').'/admin/orders/'.$order->id,
                ]),
                options: ['source_model' => $order],
            );
        }
    }
}
