import {useState} from "react";

import {router} from '@inertiajs/react';
import {PlusIcon} from 'lucide-react';
import {toast} from "sonner";

import {ProductImagesPicker} from "@/components/product-images-picker.tsx";
import {ProductVariantItem} from "@/components/product-variant-item.tsx";
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import type {Option, Product, Variant} from '@/types/models';


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
     *
     * @param variant
     * @param optionId
     * @param optionValueId
     */
    /**
     *
     * @param variant
     * @param optionId
     * @param optionValueId
     */
    const updateVariantOptionValue = (variant: Variant, optionId: number, optionValueId: number) => {
        if (!variant || !variant.id) {
            return;
        }

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
                variant_id: variant.id,
                option_id: optionId,
                option_value_id: optionValueId,
            };
        } else {
            // Add new value
            variant.values.push({
                variant_id: variant.id,
                option_id: optionId,
                option_value_id: optionValueId,
            } as any);
        }

        const newVariants = [...(product.variants ?? []).map(i => i.id === variant.id ? variant : i)];
        onUpdate(newVariants);
    };


    /**
     *
     * @param variant
     */
    const removeVariant = (variant: Variant) => {
        onUpdate((product.variants ?? []).filter(v => v.id !== variant.id))
    };

    /**
     *
     * @param variant
     * @param values
     */
    const updateVariant = (variant: Variant, values: any) => {
        onUpdate((product.variants ?? []).map(v => v.id === variant.id ? {...v, ...values} : v))
    };

    const addVariant = () => {

    };


    return <>
        <div className="col-span-9 flex flex-col gap-5">
            {/*<DuplicateVariantsAlert duplicateGroups={duplicateVariants}/>*/}

            {(product.variants ?? []).map((variant, index) => (
                <ProductVariantItem
                    key={index}
                    variant={variant}
                    onUpdate={(values: any) => {
                        updateVariant(variant, values);
                    }}
                    onRemove={(product.variants ?? [])?.length > 1 ? () => removeVariant(variant) : null}
                    onImageRemove={() => removeVariantImage(variant)}
                    onImageSelect={() => setVariantImagePicker({open: true, variant: variant})}
                    options={options}
                    onOptionValueChange={(optionId, optionValueId) => {
                        updateVariantOptionValue(variant, optionId, optionValueId);
                    }}


                    index={index}
                    disabled={false}
                />
            ))}
            {
                product?.id &&
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
