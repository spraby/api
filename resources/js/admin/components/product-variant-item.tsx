import {PlusIcon, TrashIcon} from 'lucide-react';

import {ConfirmationPopover} from '@/components/confirmation-popover';
import {PricingSection} from '@/components/pricing-section';
import type {FormVariant} from "@/components/product-form.tsx";
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VariantOptionSelector} from "@/components/variant-option-selector.tsx";
import {useProductFormContext} from '@/contexts/product-form-context.tsx';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

interface ProductVariantItemProps {
    variant: FormVariant;
    onImageRemove: () => void;
    onImageSelect: () => void;
    resolvedImageUrl?: string;
    variantNumber: number;
    canRemove: boolean;
    isDuplicate?: boolean;
}

export function ProductVariantItem({
                                       variant,
                                       onImageRemove,
                                       onImageSelect,
                                       resolvedImageUrl,
                                       variantNumber,
                                       canRemove,
                                       isDuplicate = false,
                                   }: ProductVariantItemProps) {
    const {t} = useLang();
    const {updateVariant, removeVariant, updateVariantOptionValue, options} = useProductFormContext();
    const {uid} = variant;

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
                            {t('admin.products_edit.variant')} #{variantNumber}
                        </h3>
                        <div className="flex items-center gap-2 sm:col-span-3">
                            <Checkbox
                                checked={variant.enabled}
                                id={`variant-enabled-${uid}`}
                                onCheckedChange={(checked) => {
                                    updateVariant(uid, {enabled: checked as boolean});
                                }}
                            />
                            <Label className="cursor-pointer" htmlFor={`variant-enabled-${uid}`}>
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
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => removeVariant(uid)}
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
                                        alt={variant.title || `Variant ${variantNumber}`}
                                        className="aspect-square w-full rounded-md border object-cover"
                                        src={resolvedImageUrl}
                                    />
                                    <div
                                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <ConfirmationPopover
                                            isLoading={false}
                                            message={t('admin.products_edit.variants.confirm_remove_image')}
                                            trigger={
                                                <Button
                                                    className="p-1"
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
                            <Label htmlFor={`variant-title-${uid}`}>
                                {t('admin.products_edit.fields.variant_title')}
                            </Label>
                            <Input
                                id={`variant-title-${uid}`}
                                placeholder={t('admin.products_edit.placeholders.variant_title')}
                                type="text"
                                value={variant.title ?? ''}
                                onChange={(e) => {
                                    updateVariant(uid, {title: e.target.value});
                                }}
                            />
                        </div>
                      )
                    }

                    <div className="col-span-12 space-y-2">
                        <PricingSection
                                required
                                idPrefix={`variant-${uid}-`}
                                disabled={false}
                                discount={(variant as unknown as { discount?: number }).discount ?? 0}
                                price={variant.price}
                                finalPrice={variant.final_price}
                                onChange={(values) => updateVariant(uid, values as Partial<FormVariant>)}
                            />
                    </div>

                    {/* Variant Option Values */}
                    {
                        !!options?.length && (
                            <div className="col-span-12">
                                <VariantOptionSelector
                                    options={options}
                                    variantUid={uid}
                                    variantValues={variant.values || []}
                                    onValueChange={(optionId, optionValueId) => {
                                        updateVariantOptionValue(uid, optionId, optionValueId);
                                    }}
                                />
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    );
}
