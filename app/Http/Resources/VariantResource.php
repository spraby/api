<?php

namespace App\Http\Resources;

use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Variant
 */
class VariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'product_id' => $this->product_id,
            'image_id' => $this->image_id,
            'title' => $this->title,
            'price' => $this->price,
            'final_price' => $this->final_price,
            'enabled' => $this->enabled,
            'discount' => $this->discount,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'image' => ProductImageResource::make($this->whenLoaded('image')),
            'values' => VariantValueResource::collection($this->whenLoaded('values')),
        ];
    }
}
