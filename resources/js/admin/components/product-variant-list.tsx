import {useMemo, useState} from "react";

import {router} from '@inertiajs/react';
import {PlusIcon} from 'lucide-react';
import {v4 as uuidv4} from 'uuid';

import {DuplicateVariantsAlert} from "@/components/duplicate-variants-alert.tsx";
import {ProductImagesPicker} from "@/components/product-images-picker.tsx";
import {ProductVariantItem} from "@/components/product-variant-item.tsx";
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {parseNum} from "@/lib/utils.ts";
import {VariantService} from '@/services/variant-service';
import type {Option, Product, Variant, VariantValue} from '@/types/models';

// Extended Variant type with temporary ID for new variants
type VariantWithTempId = Variant & { _tempId?: string };


interface ProductVariantListProps {
    product: Product,
    options: Option[],
    onUpdate: (variants: Variant[]) => void
}

export function ProductVariantList({
                                       product,
                                       options,
                                       onUpdate
                                   }: ProductVariantListProps) {
    const {t} = useLang();

    const [variantImagePicker, setVariantImagePicker] = useState<{
        open: boolean;
        variantKey: string | number | null;
    }>({open: false, variantKey: null});
    const [manuallyDisabledKeys, setManuallyDisabledKeys] = useState<Set<string | number>>(new Set());

    /**
     * Remove image from variant using Inertia
     * @param variant
     */
    const removeVariantImage = (variant: VariantWithTempId) => {
        if (!variant.id) {
            updateVariant(variant, {image_id: null});

            return;
        }

        router.put(
            route('sb.admin.variants.image.set', {id: variant.id}),
            {
                product_image_id: null,
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    /**
     * Set image for variant using Inertia
     * @param productImageId
     */
    const handleVariantImageSelect = (productImageId: number) => {
        const variant = getVariantByKey(variantImagePicker.variantKey);

        if (!variant) {
            return;
        }

        if (!variant?.id) {
            updateVariant(variant, {image_id: productImageId});
            setVariantImagePicker({open: false, variantKey: null});

            return;
        }

        router.put(
            route('sb.admin.variants.image.set', {id: variant.id}),
            {
                product_image_id: productImageId,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setVariantImagePicker({open: false, variantKey: null});
                },
            }
        );
    };

    /**
     * Get unique identifier for variant (id or tempId)
     * @param variant
     */
    const getVariantKey = (variant: VariantWithTempId): string | number => {
        return variant.id ?? variant._tempId ?? '';
    };

    const getVariantByKey = (key: string | number | null): VariantWithTempId | null => {
        if (!key) {
            return null;
        }

        return (product.variants ?? []).find(
            (v) => getVariantKey(v as VariantWithTempId) === key
        ) as VariantWithTempId ?? null;
    };

    /**
     * Update variant option value
     * @param variant
     * @param optionId
     * @param optionValueId
     */
    const updateVariantOptionValue = (variant: VariantWithTempId, optionId: number, optionValueId: number) => {
        if (!variant) {
            return;
        }

        const key = getVariantKey(variant);

        // Create a copy of the variant to avoid mutating the parameter
        const updatedVariant = { ...variant };

        // Initialize values array if it doesn't exist
        if (!updatedVariant.values) {
            updatedVariant.values = [];
        } else {
            updatedVariant.values = [...updatedVariant.values];
        }

        // Find existing value for this option
        const existingValueIndex = updatedVariant.values.findIndex((v) => v.option_id === optionId);

        if (existingValueIndex >= 0) {
            // Update existing value
            updatedVariant.values[existingValueIndex] = {
                ...updatedVariant.values[existingValueIndex],
                variant_id: variant.id ?? 0,
                option_id: optionId,
                option_value_id: optionValueId,
            };
        } else {
            // Add new value
            updatedVariant.values.push({
                variant_id: variant.id ?? 0,
                option_id: optionId,
                option_value_id: optionValueId,
            } as VariantValue);
        }

        const normalizedVariant = applyEnabledRules(updatedVariant, key);

        const newVariants = [...(product.variants ?? []).map(v =>
            getVariantKey(v as VariantWithTempId) === key ? normalizedVariant : v
        )];

        onUpdate(newVariants);
    };

    /**
     * Remove variant from list
     * @param variant
     */
    const removeVariant = (variant: VariantWithTempId) => {
        const key = getVariantKey(variant);

        onUpdate((product.variants ?? []).filter(v => getVariantKey(v as VariantWithTempId) !== key));
    };

    /**
     * Update variant properties
     * @param variant
     * @param values
     */
    const updateVariant = (variant: VariantWithTempId, values: Partial<Variant>) => {
        const key = getVariantKey(variant);

        onUpdate((product.variants ?? []).map(v =>
            getVariantKey(v as VariantWithTempId) === key
                ? (() => {
                    const updatedVariant = { ...v, ...values };

                    return applyEnabledRules(updatedVariant, key, values);
                })()
                : v
        ));

        if (typeof values.enabled === 'boolean') {
            setManuallyDisabledKeys((prev) => {
                const next = new Set(prev);

                if (values.enabled) {
                    next.delete(key);
                } else {
                    next.add(key);
                }

                return next;
            });
        }
    };

    const productImages = product.images ?? [];
    const hasProductImages = productImages.length > 0;

    const optionsWithValues = useMemo(() => {
        return options.filter((option) => (option.values?.length ?? 0) > 0);
    }, [options]);

    const getVariantImageUrl = (variant: Variant): string | null => {
        if (variant.image?.image?.url) {
            return variant.image.image.url;
        }

        if (!variant.image_id) {
            return null;
        }

        const productImage = productImages.find((image) => image.id === variant.image_id);

        return productImage?.image?.url ?? null;
    };

    const isVariantComplete = (variant: Variant): boolean => {
        const hasTitle = !!(variant.title ?? '').trim();
        const hasPrice = parseNum(variant.price) > 0;
        const hasFinalPrice = parseNum(variant.final_price) > 0;
        const hasImage = !!variant.image_id;
        const hasAllOptions = optionsWithValues.length === 0 || optionsWithValues.every((option) => {
            const value = (variant.values ?? []).find((item) => item.option_id === option.id);

            return !!value?.option_value_id;
        });

        return hasTitle && hasPrice && hasFinalPrice && hasImage && hasAllOptions;
    };

    const applyEnabledRules = (
        variant: Variant,
        key: string | number,
        nextValues?: Partial<Variant>
    ): Variant => {
        const complete = isVariantComplete(variant);

        if (!complete) {
            return { ...variant, enabled: false };
        }

        const manualDisabled = typeof nextValues?.enabled === 'boolean'
            ? nextValues.enabled === false
            : manuallyDisabledKeys.has(key);

        if (manualDisabled) {
            return { ...variant, enabled: false };
        }

        return { ...variant, enabled: true };
    };

    /**
     * Add new variant with temporary ID
     * Automatically generates values based on available options
     */
    /**
     * Check if adding new variant is possible
     */
    const canAddVariant = VariantService.hasAvailableCombinations(
        options,
        product.variants ?? []
    );

    /**
     * Find duplicate variant groups and create a Set of duplicate indices
     */
    const duplicateGroups = useMemo(() => {
        return VariantService.findDuplicateGroups(product.variants ?? []);
    }, [product.variants]);

    const duplicateIndices = useMemo(() => {
        const indices = new Set<number>();

        for (const group of duplicateGroups) {
            for (const index of group) {
                indices.add(index);
            }
        }

        return indices;
    }, [duplicateGroups]);

    const duplicateGroupMap = useMemo(() => {
        const map = new Map<number, number[]>();

        for (const group of duplicateGroups) {
            for (const index of group) {
                map.set(index, group);
            }
        }

        return map;
    }, [duplicateGroups]);

    const addVariant = () => {
        // Generate first unique combination that doesn't exist in current variants
        const generatedValues = VariantService.generateVariantValues(
            options,
            product.variants ?? []
        );

        // If no combinations available, button should be disabled (shouldn't reach here)
        if (!generatedValues) {
            return;
        }

        const newVariant: VariantWithTempId = {
            _tempId: uuidv4(),
            product_id: product.id ?? 0,
            title: '',
            price: '0.00',
            final_price: '0.00',
            enabled: false,
            image_id: null,
            values: generatedValues as VariantValue[],
        };

        onUpdate([...(product.variants ?? []), newVariant as Variant]);
    };

    return <>
        <div className="col-span-9 flex flex-col gap-5">
            {(product.variants ?? []).map((variant, index) => {
                const variantWithTempId = variant as VariantWithTempId;
                const duplicateGroup = duplicateGroupMap.get(index);

                return (
                    <div key={getVariantKey(variantWithTempId)} className="flex flex-col gap-3">
                        {!!duplicateGroup && (
                            <DuplicateVariantsAlert duplicateGroups={[duplicateGroup]} />
                        )}
                        <ProductVariantItem
                            variant={variant}
                            onUpdate={(values: Partial<Variant>) => {
                                updateVariant(variantWithTempId, values);
                            }}
                            onRemove={(product.variants ?? [])?.length > 1 ? () => removeVariant(variantWithTempId) : null}
                            onImageRemove={() => removeVariantImage(variantWithTempId)}
                            onImageSelect={() => {
                                setVariantImagePicker({open: true, variantKey: getVariantKey(variantWithTempId)});
                            }}
                            options={options}
                            onOptionValueChange={(optionId, optionValueId) => {
                                updateVariantOptionValue(variantWithTempId, optionId, optionValueId);
                            }}
                            index={index}
                            disabled={false}
                            isDuplicate={duplicateIndices.has(index)}
                            hasImages={hasProductImages}
                            imageUrl={getVariantImageUrl(variant)}
                            canEnable={isVariantComplete(variant)}
                        />
                    </div>
                );
            })}
            <div className="flex items-center justify-end">
                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        disabled={!canAddVariant}
                    >
                        <PlusIcon className="size-4"/>
                        {t('admin.products_edit.actions.add_variant')}
                    </Button>
                </div>
        </div>
        {
            !!product?.images?.length && (
                <ProductImagesPicker
                    currentImageId={getVariantByKey(variantImagePicker.variantKey)?.image_id ?? null}
                    open={variantImagePicker.open}
                    productImages={product?.images || []}
                    onOpenChange={(open) => {
                        setVariantImagePicker({open, variantKey: null});
                    }}
                    onSelect={handleVariantImageSelect}
                />
            )
        }
    </>
}
