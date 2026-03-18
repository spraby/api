<?php

namespace App\Http\Resources;

use App\Models\OrderShipping;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrderShipping
 */
class OrderShippingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'order_id' => $this->order_id,
            'name' => $this->name,
            'phone' => $this->phone,
            'note' => $this->note,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
