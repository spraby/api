<?php

namespace App\Http\Requests;

use App\Models\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /** Домен нормализуем так же, как в отдельной форме домена. */
    protected function prepareForValidation(): void
    {
        if ($this->has('domain')) {
            $this->merge(['domain' => UpdateBrandDomainRequest::normalizeDomain($this->input('domain'))]);
        }
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return UpdateBrandDomainRequest::domainMessages();
    }

    /**
     * @return array[]
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'domain' => UpdateBrandDomainRequest::domainRules($this->route('brand')),
            'description' => ['nullable', 'string'],
            'employment_type' => ['nullable', Rule::in(array_keys(Brand::EMPLOYMENT_TYPES))],
            'type' => ['nullable', Rule::in(Brand::TYPES)],
            'category_ids' => ['present', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ];
    }
}
