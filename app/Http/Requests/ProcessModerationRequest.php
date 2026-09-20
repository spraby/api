<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessModerationRequest extends FormRequest
{
    public const REASON_MAX_LENGTH = 255;

    /** Право проверяет контроллер политикой ModerationRequest::update. */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        // Отказ без объяснения бесполезен бренду — там пояснение обязательно,
        // при одобрении это необязательный комментарий модератора.
        // 255 — ширина колонки moderation_requests.reason.
        // Держим предел здесь и в UI, чтобы длинный текст не падал на уровне БД.
        $reason = $this->routeIs('admin.moderation.reject')
            ? ['required', 'string', 'min:3', 'max:'.self::REASON_MAX_LENGTH]
            : ['nullable', 'string', 'max:'.self::REASON_MAX_LENGTH];

        return ['reason' => $reason];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reason.required' => __('admin.moderation.show.actions.reason_required'),
        ];
    }
}
