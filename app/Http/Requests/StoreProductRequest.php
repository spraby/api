<?php

namespace App\Http\Requests;

use App\Http\Requests\Traits\ProductValidationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\App;

class StoreProductRequest extends FormRequest
{
    use ProductValidationRules;

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
        return array_merge($this->baseProductRules(), [
            // Image file uploads
            'images' => ['nullable', 'array', 'max:50'],
            'images.*' => ['image', 'max:10240'],

            // Attach existing images by ID
            'existing_image_ids' => ['nullable', 'array'],
            'existing_image_ids.*' => ['integer', 'exists:images,id'],

            // Ordering: preserves mixed upload/existing sequence (e.g., 'upload:0', 'existing:0')
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string', 'regex:/^(upload|existing):\d+$/'],

            // Variant-to-image mapping by index into image_order
            'variants.*.image_index' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
