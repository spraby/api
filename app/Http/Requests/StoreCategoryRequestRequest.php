<?php

namespace App\Http\Requests;

use App\Models\Brand;
use App\Models\CategoryRequest;
use App\Models\CategoryRequestItem;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'comment' => ['required', 'string', 'min:3', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_array($this->category_ids)) {
            $this->merge([
                'category_ids' => array_values(array_unique(array_map('intval', $this->category_ids))),
            ]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var User|null $user */
            $user = $this->user();
            /** @var Brand|null $brand */
            $brand = $user?->getBrand();

            if (! $brand) {
                $validator->errors()->add('category_ids', __('admin.category_requests.errors.no_brand'));

                return;
            }

            $ids = $this->input('category_ids', []);
            if (! is_array($ids) || empty($ids)) {
                return;
            }

            $alreadyAttached = $brand->categories()->whereIn('categories.id', $ids)->pluck('categories.id')->all();
            if (! empty($alreadyAttached)) {
                $validator->errors()->add('category_ids', __('admin.category_requests.errors.already_attached'));
            }

            $pendingIds = CategoryRequestItem::query()
                ->whereIn('category_id', $ids)
                ->where('status', CategoryRequestItem::STATUS_PENDING)
                ->whereHas('request', function ($query) use ($brand) {
                    $query->where('brand_id', $brand->id)
                        ->where('status', CategoryRequest::STATUS_PENDING);
                })
                ->pluck('category_id')
                ->all();

            if (! empty($pendingIds)) {
                $validator->errors()->add('category_ids', __('admin.category_requests.errors.already_requested'));
            }
        });
    }
}
