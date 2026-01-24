<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'handle' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('collections', 'handle')->ignore($this->route('collection')),
            ],
            'name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'header' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
