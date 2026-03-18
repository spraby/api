<?php

namespace App\Http\Resources;

use App\Models\BrandRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BrandRequest
 */
class BrandRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uid' => uniqid(),
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'name' => $this->name,
            'brand_name' => $this->brand_name,
            'status' => $this->status,
            'brand_id' => $this->brand_id,
            'user_id' => $this->user_id,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_by' => $this->reviewed_by,
            'approved_at' => $this->approved_at?->toISOString(),
            'rejected_at' => $this->rejected_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'reviewer' => UserResource::make($this->whenLoaded('reviewer')),
        ];
    }
}
