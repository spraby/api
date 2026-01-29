<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\App;

class UpdateProductRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure locale is set from session before validation
        $locale = session('locale', config('app.locale'));
        App::setLocale($locale);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array[]
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'final_price' => ['nullable', 'numeric', 'min:0'],
            'enabled' => ['required', 'boolean'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['nullable', 'integer', 'exists:variants,id'],
            'variants.*.title' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.final_price' => ['required', 'numeric', 'min:0'],
            'variants.*.enabled' => ['required', 'boolean'],
            'variants.*.image_id' => ['nullable', 'integer', 'exists:product_images,id'],
            'variants.*.values' => ['nullable', 'array'],
            'variants.*.values.*.option_id' => ['required', 'exists:options,id'],
            'variants.*.values.*.option_value_id' => ['required', 'exists:option_values,id'],
        ];
    }
}
