<?php

namespace App\Http\Resources;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Brand
 */
class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
            'images' => ImageResource::collection($this->whenLoaded('images')),
            'addresses' => AddressResource::collection($this->whenLoaded('addresses')),
            'contacts' => ContactResource::collection($this->whenLoaded('contacts')),
            'shipping_methods' => ShippingMethodResource::collection($this->whenLoaded('shippingMethods')),
        ];
    }
}
