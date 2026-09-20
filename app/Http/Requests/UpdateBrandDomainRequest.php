<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandDomainRequest extends FormRequest
{
    /**
     * Правила домена общие для отдельной формы (страница заявки) и для
     * основной формы бренда — держим их в одном месте.
     *
     * @return array<int, mixed>
     */
    public static function domainRules(mixed $ignore = null): array
    {
        return [
            'nullable',
            'string',
            'max:255',
            // Хэндл — сегмент адреса /brands/<handle>: латиница, цифры, дефис.
            // Точки и слэши недопустимы, иначе сломается маршрут витрины.
            'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
            Rule::unique('brands', 'domain')->ignore($ignore),
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function domainMessages(): array
    {
        return [
            'domain.regex' => __('admin.brands_edit.domain.invalid'),
            'domain.unique' => __('admin.brands_edit.domain.taken'),
        ];
    }

    /** Регистр в домене значения не имеет, пустая строка — это «нет домена». */
    public static function normalizeDomain(mixed $domain): ?string
    {
        if (! is_string($domain)) {
            return null;
        }

        $domain = mb_strtolower(trim($domain));

        // Из буфера часто прилетает готовый адрес — оставляем только хэндл.
        if (preg_match('~(?:^https?://)?[^/]*/brands/([^/?#]+)~', $domain, $matches)) {
            $domain = $matches[1];
        }

        return $domain === '' ? null : $domain;
    }

    /** Право проверяет контроллер политикой Brand::updateDomain. */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Домен приводим к нижнему регистру и режем пробелы: значение
     * участвует в поиске бренда по домену, регистр там значения не имеет.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['domain' => self::normalizeDomain($this->input('domain'))]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'domain' => self::domainRules($this->route('brand')),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return self::domainMessages();
    }
}
