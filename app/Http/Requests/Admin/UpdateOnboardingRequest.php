<?php

namespace App\Http\Requests\Admin;

use App\Services\AdminOnboardingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManager() ?? false;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['dismiss', 'hide_hint'])],
            'step' => [
                'nullable',
                Rule::requiredIf(fn () => $this->input('action') === 'hide_hint'),
                Rule::in(AdminOnboardingService::HINTS),
            ],
        ];
    }
}
