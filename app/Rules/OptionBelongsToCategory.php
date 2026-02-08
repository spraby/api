<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class OptionBelongsToCategory implements DataAwareRule, ValidationRule
{
    protected array $data = [];

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $categoryId = $this->data['category_id'] ?? null;

        if (!$categoryId) {
            return;
        }

        $variants = $value;

        if (!is_array($variants)) {
            return;
        }

        // Collect all option_ids and option_value_ids from variants
        $optionIds = [];
        $optionValuePairs = []; // [option_id => [option_value_ids]]

        foreach ($variants as $variant) {
            foreach ($variant['values'] ?? [] as $val) {
                $optionId = $val['option_id'] ?? null;
                $optionValueId = $val['option_value_id'] ?? null;

                if ($optionId) {
                    $optionIds[] = $optionId;
                }

                if ($optionId && $optionValueId) {
                    $optionValuePairs[$optionId][] = $optionValueId;
                }
            }
        }

        $optionIds = array_unique($optionIds);

        if (empty($optionIds)) {
            return;
        }

        // Validate options belong to category (via category_option pivot)
        $validOptionIds = DB::table('category_option')
            ->where('category_id', $categoryId)
            ->whereIn('option_id', $optionIds)
            ->pluck('option_id')
            ->toArray();

        $invalidOptionIds = array_diff($optionIds, $validOptionIds);

        if (!empty($invalidOptionIds)) {
            $fail(__('validation.option_belongs_to_category'));
            return;
        }

        // Validate option_values belong to their options
        foreach ($optionValuePairs as $optionId => $valueIds) {
            $uniqueValueIds = array_unique($valueIds);

            $validCount = DB::table('option_values')
                ->where('option_id', $optionId)
                ->whereIn('id', $uniqueValueIds)
                ->count();

            if ($validCount !== count($uniqueValueIds)) {
                $fail(__('validation.option_value_belongs_to_option'));
                return;
            }
        }
    }
}
