<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DashboardRequest extends FormRequest
{
    private const RANGE_OPTIONS = [7, 30, 90];

    private const CONVERSION_SORT_KEYS = ['view_to_cart', 'view_to_order', 'cart_to_order'];

    public function authorize(): bool
    {
        return true;
    }

    public function validationData(): array
    {
        return $this->query();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'range' => (int) $this->query('range', 30),
            'table' => $this->query('table', 'top'),
            'conv_sort' => $this->query('conv_sort', 'view_to_order'),
            'conv_dir' => $this->query('conv_dir', 'desc'),
            'conv_page' => max(1, (int) $this->query('conv_page', 1)),
        ]);
    }

    public function rules(): array
    {
        return [
            'range' => ['integer', 'in:' . implode(',', self::RANGE_OPTIONS)],
            'table' => ['string', 'in:top,gap'],
            'conv_sort' => ['string', 'in:' . implode(',', self::CONVERSION_SORT_KEYS)],
            'conv_dir' => ['string', 'in:asc,desc'],
            'conv_page' => ['integer', 'min:1'],
        ];
    }

    public function range(): int
    {
        return $this->validated('range', 30);
    }

    public function tableMode(): string
    {
        return $this->validated('table', 'top');
    }

    public function conversionSort(): string
    {
        return $this->validated('conv_sort', 'view_to_order');
    }

    public function conversionDirection(): string
    {
        return $this->validated('conv_dir', 'desc');
    }

    public function conversionPage(): int
    {
        return $this->validated('conv_page', 1);
    }

    public function conversionPerPage(): int
    {
        return 10;
    }
}
