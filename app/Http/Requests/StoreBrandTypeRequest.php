<?php

namespace App\Http\Requests;

use App\Models\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Заявка продавца на смену типа аккаунта: мастер (ремесленник/самозанятый)
 * или бизнес (ИП/ЧУП/ООО с наименованием и УНП).
 */
class StoreBrandTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // УНП часто вставляют с пробелами — храним только цифры.
        $this->merge([
            'employment_number' => preg_replace('/\s+/', '', (string) $this->input('employment_number')) ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $type = (string) $this->input('type');

        return [
            // Любой тип: заявкой меняют и тип аккаунта, и форму занятости,
            // и реквизиты. Заявку без изменений отсекает контроллер.
            'type' => ['required', Rule::in(Brand::TYPES)],
            'employment_type' => ['required', Rule::in(Brand::employmentTypesFor($type))],
            // Реквизиты обязательны только бизнесу; мастеру их не принимаем.
            'employment_name' => $type === Brand::TYPE_BUSINESS
                ? ['required', 'string', 'max:255']
                : ['exclude'],
            'employment_number' => $type === Brand::TYPE_BUSINESS
                ? ['required', 'regex:/^\d{9}$/']
                : ['exclude'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employment_type.in' => __('admin.brand_type_request.errors.employment_type_mismatch'),
            'employment_number.regex' => __('admin.settings_general.errors.employment_number_format'),
        ];
    }
}
