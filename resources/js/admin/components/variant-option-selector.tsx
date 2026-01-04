/**
 * Variant Option Selector Component
 *
 * Allows selecting option values for a product variant based on category options
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLang } from '@/lib/lang';
import type { Option, VariantValue } from '@/types/api';

interface VariantOptionSelectorProps {
  options: Option[];
  variantValues: VariantValue[];
  variantIndex: number;
  disabled?: boolean;
  onValueChange: (optionId: number, optionValueId: number) => void;
}

export function VariantOptionSelector({
  options,
  variantValues,
  variantIndex,
  disabled = false,
  onValueChange,
}: VariantOptionSelectorProps) {
  const { t } = useLang();

  if (!options || options.length === 0) {
    return null;
  }

  const getSelectedValue = (optionId: number): string => {
    const variantValue = variantValues.find((vv) => vv.option_id === optionId);

    return variantValue?.option_value_id?.toString() ?? '';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">{t('admin.products_edit.variant_options.title')}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            <Label htmlFor={`variant-${variantIndex}-option-${option.id}`}>
              {option.title}
            </Label>
            <Select
              disabled={disabled || !option.values || option.values.length === 0}
              value={getSelectedValue(option.id)}
              onValueChange={(value) => {
                if (value) {
                  onValueChange(option.id, Number(value));
                }
              }}
            >
              <SelectTrigger id={`variant-${variantIndex}-option-${option.id}`}>
                <SelectValue
                  placeholder={t('admin.products_edit.variant_options.select_placeholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {option.values?.map((optionValue) => (
                  <SelectItem key={optionValue.id} value={optionValue.id.toString()}>
                    {optionValue.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
