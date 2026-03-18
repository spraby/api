<?php

namespace App\Http\Resources;

use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Option
 */
class OptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'name' => $this->name,
            'title' => $this->title,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'values' => OptionValueResource::collection($this->whenLoaded('values')),
        ];
    }
}
