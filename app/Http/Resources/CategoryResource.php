<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'options' => OptionResource::collection($this->whenLoaded('options')),
            'collections' => CollectionResource::collection($this->whenLoaded('collections')),
            'brands' => BrandResource::collection($this->whenLoaded('brands')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
