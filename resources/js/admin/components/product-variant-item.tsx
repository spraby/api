import {PlusIcon, TrashIcon} from 'lucide-react';

import {ConfirmationPopover} from '@/components/confirmation-popover';
import {PricingSection} from '@/components/pricing-section';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VariantOptionSelector} from "@/components/variant-option-selector.tsx";
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Option, Variant} from '@/types/models';

interface ProductVariantItemProps {
    variant: Variant;
    onUpdate: (values: Partial<Variant>) => void;
    onRemove: (() => void) | null
    onImageRemove: () => void;
    onImageSelect: () => void;
    options?: Option[];
    onOptionValueChange?: (optionId: number, optionValueId: number) => void;
    resolvedImageUrl?: string;

    index: number;
    disabled: boolean;
    isDuplicate?: boolean;
}

export function ProductVariantItem({
                                       variant,
                                       onUpdate,
                                       onRemove,
                                       onImageRemove,
                                       onImageSelect,
                                       options,
                                       onOptionValueChange,
                                       resolvedImageUrl,

                                       index,
                                       disabled = false,
                                       isDuplicate = false,
                                   }: ProductVariantItemProps) {
    const {t} = useLang();
    const canRemove = typeof onRemove === 'function';

    return (
        <div className={cn(
            "rounded-lg border p-4 transition-colors",
            isDuplicate
                ? "border-destructive bg-destructive/2 dark:bg-destructive/5"
                : "border-border"
        )}>
            <div className="mb-3 flex items-center justify-between">
                {
                    !!canRemove && (
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
                                    onUpdate({enabled: checked as boolean});
                                }}
                            />
                            <Label className="cursor-pointer" htmlFor={`variant-enabled-${index}`}>
                                {t('admin.products_edit.fields.variant_enabled')}
                            </Label>
                        </div>
                    </div>
                  )
                }
                {
                    !!canRemove && (
                        <Button
                            className="text-destructive hover:text-destructive"
                            disabled={disabled}
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={onRemove}
                        >
                            <TrashIcon className="size-4"/>
                        </Button>
                      )
                }
            </div>

            <div className="grid grid-cols-12 gap-5">
                {
                    !!canRemove && (
                        <div className="col-span-3 flex flex-col gap-2">
                            {resolvedImageUrl ? (
                                <div className="group relative w-full">
                                    <img
                                        alt={variant.title || `Variant ${index + 1}`}
                                        className="aspect-square w-full rounded-md border object-cover"
                                        src={resolvedImageUrl}
                                    />
                                    <div
                                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <ConfirmationPopover
                                            isLoading={disabled}
                                            message={t('admin.products_edit.variants.confirm_remove_image')}
                                            trigger={
                                                <Button
                                                    className="p-1"
                                                    disabled={disabled}
                                                    size="icon"
                                                    type="button"
                                                    variant="secondary"
                                                >
                                                    <TrashIcon className="size-2"/>
                                                </Button>
                                            }
                                            onConfirm={onImageRemove}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed">
                                    <Button
                                        disabled={disabled}
                                        size="sm"
                                        type="button"
                                        variant="secondary"
                                        onClick={onImageSelect}
                                        title={t('admin.products_edit.actions.select_image')}
                                    >
                                        <PlusIcon className="size-4"/>
                                    </Button>
                                </div>
                            )}
                        </div>
                      )
                }
                <div
                    className={`${canRemove ? 'col-span-9' : 'col-span-12'} grid grid-cols-12 gap-4`}>
                    {
                        !!canRemove && (
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
                                    onUpdate({title: e.target.value});
                                }}
                            />
                        </div>
                      )
                    }

                    <div className="col-span-12 space-y-2">
                        <PricingSection
                                required
                                idPrefix={`variant-${index}-`}
                                disabled={disabled}
                                discount={variant.discount ?? 0}
                                price={variant.price}
                                finalPrice={variant.final_price}
                                onChange={onUpdate}
                            />
                    </div>

                    {/* Variant Option Values */}
                    {
                        !!options?.length && !!onOptionValueChange && (
                            <div className="col-span-12">
                                <VariantOptionSelector
                                    disabled={disabled}
                                    options={options}
                                    variantIndex={index}
                                    variantValues={variant.values || []}
                                    onValueChange={onOptionValueChange}
                                />
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    );
}
