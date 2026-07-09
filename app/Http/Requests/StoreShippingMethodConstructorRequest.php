<?php

namespace App\Http\Requests;

use App\Models\ShippingMethodConstructor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShippingMethodConstructorRequest extends FormRequest
{
    /**
     * Конструкторы доступны для изменения только админам.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array[]
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'active' => ['required', 'boolean'],
            'position' => ['required', 'integer', 'min:0'],
            'merchant_fields' => ['present', 'array'],
            'merchant_fields.*' => ['string', Rule::in(array_keys(ShippingMethodConstructor::MERCHANT_FIELDS))],
            'customer_fields' => ['present', 'array'],
            'customer_fields.*' => ['string', Rule::in(array_keys(ShippingMethodConstructor::CUSTOMER_FIELDS))],
        ];
    }
}
