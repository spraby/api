<?php

namespace App\Http\Requests\Traits;

use App\Rules\OptionBelongsToCategory;
use App\Rules\UniqueVariantCombinations;

trait ProductValidationRules
{
    protected function baseProductRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'enabled' => ['required', 'boolean'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],

            'variants' => ['required', 'array', 'min:1', new UniqueVariantCombinations, new OptionBelongsToCategory],
            'variants.*.title' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.final_price' => ['required', 'numeric', 'min:0'],
            'variants.*.enabled' => ['required', 'boolean'],
            'variants.*.is_made_to_order' => ['required', 'boolean'],
            'variants.*.production_time_days' => [
                'nullable',
                'integer',
                'min:1',
                'max:365',
            ],
            'variants.*.values' => ['nullable', 'array'],
            'variants.*.values.*.option_id' => ['required', 'exists:options,id'],
            'variants.*.values.*.option_value_id' => ['required', 'exists:option_values,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'variants.*.is_made_to_order' => __('admin.products_edit.availability.status'),
            'variants.*.production_time_days' => __('admin.products_edit.availability.production_time'),
        ];
    }
}
