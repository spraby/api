<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateInformationRequest extends FormRequest
{
    /**
     * Лимит, который видит админ: считается по видимому тексту, без разметки,
     * иначе счётчик в форме показывал бы длину HTML и упирался бы в предел
     * заметно раньше, чем ожидает пользователь.
     */
    public const MAX_LENGTH = 5000;

    /**
     * Страховка на размер хранимого значения: разметка редактора весит
     * в разы больше текста, но расти бесконечно тоже не должна.
     */
    public const MAX_HTML_LENGTH = 20000;

    /**
     * Текст витрины редактирует только админ — менеджеру он недоступен.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'description' => ['present', 'nullable', 'string', 'max:'.self::MAX_HTML_LENGTH],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($v->errors()->has('description')) {
                return;
            }

            $length = mb_strlen(self::plainText((string) $this->input('description', '')));

            if ($length > self::MAX_LENGTH) {
                $v->errors()->add('description', __('admin.settings_information.errors.too_long', [
                    'max' => self::MAX_LENGTH,
                ]));
            }
        });
    }

    public function messages(): array
    {
        return [
            // Предел по разметке, а не по видимому тексту: сообщать про 5000
            // символов здесь было бы враньём — их может быть заметно меньше.
            'description.max' => __('admin.settings_information.errors.markup_too_long'),
        ];
    }

    /**
     * Видимый текст без разметки и HTML-сущностей.
     *
     * Правило должно совпадать с витриной (store/theme/templates/ProductPage.tsx),
     * иначе админ сохранит текст, который витрина сочтёт пустым и не покажет.
     */
    public static function plainText(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // &nbsp; разворачивается в U+00A0, который trim() не считает пробелом.
        $text = str_replace("\u{00A0}", ' ', $text);

        return trim($text);
    }
}
