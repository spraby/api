import {useState} from "react";

import {router} from '@inertiajs/react';
import {PlusIcon} from 'lucide-react';
import {toast} from "sonner";
import {v4 as uuidv4} from 'uuid';

import {ProductImagesPicker} from "@/components/product-images-picker.tsx";
import {ProductVariantItem} from "@/components/product-variant-item.tsx";
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import type {Option, Product, Variant} from '@/types/models';

// Extended Variant type with temporary ID for new variants
type VariantWithTempId = Variant & { _tempId?: string };


interface ProductVariantListProps {
    product: Product,
    options: Option[],
    onUpdate: (variants: Variant[]) => any
}

export function ProductVariantList({
                                       product,
                                       options,
                                       onUpdate
                                   }: ProductVariantListProps) {
    const {t} = useLang();

    const [variantImagePicker, setVariantImagePicker] = useState<{
        open: boolean;
        variant: Variant | null;
    }>({open: false, variant: null});

    /**
     * Remove image from variant using Inertia
     * @param variant
     */
    const removeVariantImage = (variant: Variant) => {
        if (!variant.id) {
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
        if (!variantImagePicker.variant) {
            return;
        }

        const variant = variantImagePicker.variant;

        if (!variant?.id) {
            toast.error(t('admin.products_edit.errors.save_variant_first'));
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
                    setVariantImagePicker({open: false, variant: null});
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

        // Initialize values array if it doesn't exist
        if (!variant.values) {
            variant.values = [];
        }

        // Find existing value for this option
        const existingValueIndex = variant.values.findIndex((v) => v.option_id === optionId);

        if (existingValueIndex >= 0) {
            // Update existing value
            variant.values[existingValueIndex] = {
                ...variant.values[existingValueIndex],
                variant_id: variant.id ?? 0,
                option_id: optionId,
                option_value_id: optionValueId,
            };
        } else {
            // Add new value
            variant.values.push({
                variant_id: variant.id ?? 0,
                option_id: optionId,
                option_value_id: optionValueId,
            } as any);
        }

        const newVariants = [...(product.variants ?? []).map(v =>
            getVariantKey(v as VariantWithTempId) === key ? variant : v
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
    const updateVariant = (variant: VariantWithTempId, values: any) => {
        const key = getVariantKey(variant);
        onUpdate((product.variants ?? []).map(v =>
            getVariantKey(v as VariantWithTempId) === key ? {...v, ...values} : v
        ));
    };

    /**
     * Add new variant with temporary ID
     */
    const addVariant = () => {
        const newVariant: VariantWithTempId = {
            _tempId: uuidv4(),
            product_id: product.id ?? 0,
            title: '',
            price: '0.00',
            final_price: '0.00',
            enabled: false,
            image_id: null,
            values: [],
        };

        onUpdate([...(product.variants ?? []), newVariant as Variant]);
    };

    return <>
        <div className="col-span-9 flex flex-col gap-5">
            {/*<DuplicateVariantsAlert duplicateGroups={duplicateVariants}/>*/}

            {(product.variants ?? []).map((variant, index) => {
                const variantWithTempId = variant as VariantWithTempId;
                return (
                    <ProductVariantItem
                        key={getVariantKey(variantWithTempId)}
                        variant={variant}
                        onUpdate={(values: any) => {
                            updateVariant(variantWithTempId, values);
                        }}
                        onRemove={(product.variants ?? [])?.length > 1 ? () => removeVariant(variantWithTempId) : null}
                        onImageRemove={() => removeVariantImage(variant)}
                        onImageSelect={() => setVariantImagePicker({open: true, variant: variant})}
                        options={options}
                        onOptionValueChange={(optionId, optionValueId) => {
                            updateVariantOptionValue(variantWithTempId, optionId, optionValueId);
                        }}
                        index={index}
                        disabled={false}
                    />
                );
            })}
            {
                <div className="flex items-center justify-end">
                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                    >
                        <PlusIcon className="size-4"/>
                        {t('admin.products_edit.actions.add_variant')}
                    </Button>
                </div>
            }
        </div>
        {
            !!product?.images?.length && (
                <ProductImagesPicker
                    currentImageId={variantImagePicker?.variant?.image_id ?? null}
                    open={variantImagePicker.open}
                    productImages={product?.images || []}
                    onOpenChange={(open) => {
                        setVariantImagePicker({open, variant: null});
                    }}
                    onSelect={handleVariantImageSelect}
                />
            )
        }
    </>
}
