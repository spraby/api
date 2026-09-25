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

        // УНП часто вставляют с пробелами — храним только цифры.
        if ($this->has('employment_number')) {
            $this->merge([
                'employment_number' => preg_replace('/\s+/', '', (string) $this->input('employment_number')) ?: null,
            ]);
        }
    }

    /**
     * Тип, под который проверяем форму занятости и реквизиты: присланный,
     * если его может менять текущий пользователь, иначе текущий тип бренда.
     */
    private function effectiveType(): string
    {
        /** @var Brand|null $brand */
        $brand = $this->route('brand');

        if ($this->filled('type') && $this->user()?->can('updateType', Brand::class)) {
            return (string) $this->input('type');
        }

        return $brand?->type ?? Brand::TYPE_MASTER;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...UpdateBrandDomainRequest::domainMessages(),
            'employment_type.in' => __('admin.brand_type_request.errors.employment_type_mismatch'),
            'employment_number.regex' => __('admin.settings_general.errors.employment_number_format'),
        ];
    }

    /**
     * @return array[]
     */
    public function rules(): array
    {
        $isBusiness = $this->effectiveType() === Brand::TYPE_BUSINESS;

        return [
            'name' => ['required', 'string', 'max:255'],
            'domain' => UpdateBrandDomainRequest::domainRules($this->route('brand')),
            'description' => ['nullable', 'string'],
            'employment_type' => ['nullable', Rule::in(Brand::employmentTypesFor($this->effectiveType()))],
            // Админ может сохранить бизнес и без реквизитов — у старых брендов их нет.
            'employment_name' => $isBusiness ? ['nullable', 'string', 'max:255'] : ['exclude'],
            'employment_number' => $isBusiness ? ['nullable', 'regex:/^\d{9}$/'] : ['exclude'],
            'type' => ['nullable', Rule::in(Brand::TYPES)],
            'category_ids' => ['present', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ];
    }
}
