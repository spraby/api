<?php

namespace App\Http\Requests\Traits;

use App\Models\Variant;
use App\Rules\OptionBelongsToCategory;
use App\Rules\UniqueVariantCombinations;
use Illuminate\Contracts\Validation\Validator;

trait ProductValidationRules
{
    protected function baseProductRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'enabled' => ['required', 'boolean'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],

            'variants' => ['required', 'array', 'min:1', new UniqueVariantCombinations(), new OptionBelongsToCategory()],
            'variants.*.title' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.final_price' => ['required', 'numeric', 'min:0'],
            'variants.*.enabled' => ['required', 'boolean'],
            'variants.*.is_made_to_order' => ['required', 'boolean'],
            'variants.*.production_time_days' => [
                'nullable',
                'integer',
                'min:'.Variant::PRODUCTION_TIME_MIN_DAYS,
                'max:'.Variant::PRODUCTION_TIME_MAX_DAYS,
            ],
            'variants.*.values' => ['nullable', 'array'],
            'variants.*.values.*.option_id' => ['required', 'exists:options,id'],
            'variants.*.values.*.option_value_id' => ['required', 'exists:option_values,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->boolean('enabled')) {
                return;
            }

            // Опубликованный товар не может продаваться за 0
            $hasZeroPrice = collect($this->input('variants', []))
                ->filter(fn ($variant) => filter_var($variant['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN))
                ->contains(fn ($variant) => (float) ($variant['price'] ?? 0) <= 0 || (float) ($variant['final_price'] ?? 0) <= 0);

            if ($hasZeroPrice) {
                $validator->errors()->add('variants', __('admin.products_edit.validation.zero_price_publish'));
            }
        });
    }
}
