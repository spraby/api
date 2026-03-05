<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'delivery_status' => $this->delivery_status,
            'financial_status' => $this->financial_status,
            'status_url' => $this->statusUrl,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'order_shippings' => OrderShippingResource::collection($this->whenLoaded('orderShippings')),
        ];
    }
}
