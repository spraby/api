<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrderItem
 */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'image_id' => $this->image_id,
            'title' => $this->title,
            'variant_title' => $this->variant_title,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'final_price' => $this->final_price,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'product' => ProductResource::make($this->whenLoaded('product')),
            'variant' => VariantResource::make($this->whenLoaded('variant')),
            'image' => ProductImageResource::make($this->whenLoaded('image')),
        ];
    }
}
