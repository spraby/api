<?php

namespace App\Http\Resources;

use App\Models\VariantValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VariantValue
 */
class VariantValueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'variant_id' => $this->variant_id,
            'option_id' => $this->option_id,
            'option_value_id' => $this->option_value_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'option' => OptionResource::make($this->whenLoaded('option')),
            'value' => OptionValueResource::make($this->whenLoaded('value')),
        ];
    }
}
