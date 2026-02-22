import {TrashIcon} from 'lucide-react';

import {PricingSection} from '@/components/pricing-section';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {VariantImagePickerDialog} from '@/components/variant-image-picker-dialog';
import type {PickableImage} from '@/components/variant-image-picker-dialog';
import {VariantOptionSelector} from '@/components/variant-option-selector';
import {useLang} from '@/lib/lang';
import {parseNum} from '@/lib/utils';
import type {Option} from '@/types/models';

export interface VariantFormItem {
    id?: number;
    title: string;
    price: number;
    final_price: number;
    enabled: boolean;
    image_id: number | null;
    image_index: number | null;
    values: {option_id: number; option_value_id: number}[];
}

interface ProductVariantItemProps {
    variant: VariantFormItem;
    index: number;
    options: Option[];
    pickableImages: PickableImage[];
    isEdit: boolean;
    disabled?: boolean;
    onChange: (variant: VariantFormItem) => void;
    onDelete: () => void;
}

export function ProductVariantItem({
    variant,
    index,
    options,
    pickableImages,
    isEdit,
    disabled,
    onChange,
    onDelete,
}: ProductVariantItemProps) {
    const {t} = useLang();

    const selectedImageId = isEdit ? variant.image_id : variant.image_index;

    const handleValueChange = (optionId: number, optionValueId: number) => {
        const existing = variant.values.findIndex(v => v.option_id === optionId);
        const newValues = [...variant.values];

        if (existing >= 0) {
            newValues[existing] = {option_id: optionId, option_value_id: optionValueId};
        } else {
            newValues.push({option_id: optionId, option_value_id: optionValueId});
        }

        onChange({...variant, values: newValues});
    };

    const handlePricingChange = (values: {price: string; final_price: string}) => {
        onChange({
            ...variant,
            price: parseNum(values.price),
            final_price: parseNum(values.final_price),
        });
    };

    const handleImageSelect = (id: number | null) => {
        if (isEdit) {
            onChange({...variant, image_id: id});
        } else {
            onChange({...variant, image_index: id});
        }
    };

    const discount = variant.price > 0
        ? Math.round(((variant.price - variant.final_price) / variant.price) * 100)
        : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium">
                    {t('admin.products_edit.variant')} #{index + 1}
                </span>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={variant.enabled}
                        disabled={disabled}
                        onCheckedChange={checked => onChange({...variant, enabled: checked})}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        onClick={onDelete}
                    >
                        <TrashIcon className="size-4"/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <VariantOptionSelector
                    options={options}
                    variantValues={variant.values}
                    variantUid={`variant-${index}`}
                    disabled={disabled}
                    onValueChange={handleValueChange}
                />
                <PricingSection
                    price={variant.price.toString()}
                    finalPrice={variant.final_price.toString()}
                    discount={discount}
                    disabled={disabled}
                    required
                    idPrefix={`variant-${index}-`}
                    onChange={handlePricingChange}
                />
                {pickableImages.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Label>{t('admin.products_edit.fields.variant_image')}</Label>
                        <VariantImagePickerDialog
                            images={pickableImages}
                            selectedId={selectedImageId}
                            disabled={disabled}
                            onSelect={handleImageSelect}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
