
import {ImageIcon, PlusIcon, TrashIcon} from 'lucide-react';

import {ConfirmationPopover} from '@/components/confirmation-popover';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VariantOptionSelector} from '@/components/variant-option-selector';
import {useLang} from '@/lib/lang';
import type {Option, Variant} from '@/types/api';

interface ProductVariantItemProps {
    variant: Variant;
    index: number;
    variantsLength: number;
    disabled: boolean;
    productCategoryOptions?: Option[] | undefined;
    onUpdate: (field: keyof Variant, value: string | boolean) => void;
    onRemove: () => void;
    onImageSelect: () => void;
    onImageRemove: () => void;
    onOptionValueChange?: (optionId: number, optionValueId: number) => void;
}

export function ProductVariantItem({
    variant,
    index,
    variantsLength,
    disabled,
    productCategoryOptions,
    onUpdate,
    onRemove,
    onImageSelect,
    onImageRemove,
    onOptionValueChange,
}: ProductVariantItemProps) {
    const {t} = useLang();

    return (
        <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-row gap-5">
                    <h3 className="font-medium">
                        {t('admin.products_edit.variant')} #{index + 1}
                    </h3>
                    <div className="flex items-center gap-2 sm:col-span-3">
                        <Checkbox
                            checked={variant.enabled}
                            disabled={disabled}
                            id={`variant-enabled-${index}`}
                            onCheckedChange={(checked) => {
                                onUpdate('enabled', checked as boolean);
                            }}
                        />
                        <Label className="cursor-pointer" htmlFor={`variant-enabled-${index}`}>
                            {t('admin.products_edit.fields.variant_enabled')}
                        </Label>
                    </div>
                </div>
                {variantsLength > 1 && (
                    <Button
                        className="text-destructive hover:text-destructive"
                        disabled={disabled}
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={onRemove}
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-3 flex flex-col gap-2">
                    {variant.image_url ? (
                        <div className="group relative w-full">
                            <img
                                alt={variant.title || `Variant ${index + 1}`}
                                className="size-50 rounded-md border object-cover"
                                src={variant.image_url}
                            />
                            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <ConfirmationPopover
                                    isLoading={disabled}
                                    message={t('admin.products_edit.variants.confirm_remove_image')}
                                    trigger={
                                        <Button
                                            disabled={disabled || !variant.id}
                                            size="icon"
                                            type="button"
                                            variant="secondary"
                                        >
                                            <TrashIcon className="size-4" />
                                        </Button>
                                    }
                                    onConfirm={onImageRemove}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex size-20 items-center justify-center rounded-md border bg-muted">
                            <ImageIcon className="size-8 text-muted-foreground" />
                        </div>
                    )}
                    <Button
                        disabled={disabled || !variant.id}
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={onImageSelect}
                    >
                        <PlusIcon className="mr-2 size-4" />
                        {variant.image_url
                            ? t('admin.products_edit.actions.change_image')
                            : t('admin.products_edit.actions.select_image')}
                    </Button>
                    {!variant.id && (
                        <span className="text-xs text-muted-foreground">
                            {t('admin.products_edit.hints.save_to_add_image')}
                        </span>
                    )}
                </div>
                <div className="col-span-9 grid grid-cols-12 gap-4">
                    <div className="col-span-12 space-y-2">
                        <Label htmlFor={`variant-title-${index}`}>
                            {t('admin.products_edit.fields.variant_title')}
                        </Label>
                        <Input
                            disabled={disabled}
                            id={`variant-title-${index}`}
                            placeholder={t('admin.products_edit.placeholders.variant_title')}
                            type="text"
                            value={variant.title ?? ''}
                            onChange={(e) => {
                                onUpdate('title', e.target.value);
                            }}
                        />
                    </div>

                    <div className="col-span-12 grid grid-cols-12 gap-5 space-y-2">
                        <div className="col-span-6 space-y-2">
                            <Label className="flex items-center gap-1" htmlFor={`variant-price-${index}`}>
                                {t('admin.products_edit.fields.price')}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                required
                                disabled={disabled}
                                id={`variant-price-${index}`}
                                min="0"
                                placeholder={t('admin.products_edit.placeholders.price')}
                                step="0.01"
                                type="number"
                                value={variant.price}
                                onChange={(e) => {
                                    onUpdate('price', e.target.value);
                                }}
                            />
                        </div>

                        <div className="col-span-6 space-y-2">
                            <Label className="flex items-center gap-1" htmlFor={`variant-final-price-${index}`}>
                                {t('admin.products_edit.fields.final_price')}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                required
                                disabled={disabled}
                                id={`variant-final-price-${index}`}
                                min="0"
                                placeholder={t('admin.products_edit.placeholders.final_price')}
                                step="0.01"
                                type="number"
                                value={variant.final_price}
                                onChange={(e) => {
                                    onUpdate('final_price', e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    {/* Variant Option Values */}
                    {Boolean(productCategoryOptions?.length) && !!productCategoryOptions && !!onOptionValueChange && (
                        <div className="col-span-12">
                            <VariantOptionSelector
                                disabled={disabled}
                                options={productCategoryOptions}
                                variantIndex={index}
                                variantValues={variant.values || []}
                                onValueChange={onOptionValueChange}
                            />
                        </div>
                      )}
                </div>
            </div>
        </div>
    );
}
