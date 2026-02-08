<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueVariantCombinations implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_array($value)) {
            return;
        }

        $signatures = [];

        foreach ($value as $index => $variant) {
            $values = $variant['values'] ?? [];

            if (empty($values)) {
                continue;
            }

            // Normalize: extract (option_id, option_value_id) pairs, sort them
            $pairs = array_map(
                fn ($v) => $v['option_id'] . ':' . $v['option_value_id'],
                $values
            );
            sort($pairs);
            $signature = implode('|', $pairs);

            if (in_array($signature, $signatures, true)) {
                $fail(__('validation.unique_variant_combinations'));
                return;
            }

            $signatures[] = $signature;
        }
    }
}
