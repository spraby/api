<?php

namespace App\Http\Resources;

use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShippingMethod
 */
class ShippingMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'constructor_id' => $this->shipping_method_constructor_id,
            // Название живёт на конструкторе; relation догрузится лениво, если не была eager-loaded
            'name' => $this->methodConstructor?->name,
            'merchant_settings' => $this->merchant_settings,
            'customer_settings' => $this->customer_settings,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
