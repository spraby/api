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

            'variants' => ['required', 'array', 'min:1', new UniqueVariantCombinations(), new OptionBelongsToCategory()],
            'variants.*.title' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.final_price' => ['required', 'numeric', 'min:0'],
            'variants.*.enabled' => ['required', 'boolean'],
            'variants.*.values' => ['nullable', 'array'],
            'variants.*.values.*.option_id' => ['required', 'exists:options,id'],
            'variants.*.values.*.option_value_id' => ['required', 'exists:option_values,id'],
        ];
    }
}
