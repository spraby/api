<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'enabled' => $this->enabled,
            'brand_id' => $this->brand_id,
            'category_id' => $this->category_id,
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'image_url' => $this->imageUrl,
            'external_url' => $this->externalUrl,
            'min_price' => $this->minPrice,
            'max_price' => $this->maxPrice,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
