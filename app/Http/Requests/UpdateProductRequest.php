<?php

namespace App\Http\Requests;

use App\Http\Requests\Traits\ProductValidationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\App;

class UpdateProductRequest extends FormRequest
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
            'variants.*.id' => ['nullable', 'integer', 'exists:variants,id'],
        ]);
    }
}
