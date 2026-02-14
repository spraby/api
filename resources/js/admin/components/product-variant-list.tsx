import {useMemo, useState} from "react";

import {router} from '@inertiajs/react';
import {PlusIcon} from 'lucide-react';
import {toast} from 'sonner';

import {DuplicateVariantsAlert} from "@/components/duplicate-variants-alert.tsx";
import type {FormVariant} from "@/components/product-form.tsx";
import {ProductImagesPicker} from "@/components/product-images-picker.tsx";
import {ProductVariantItem} from "@/components/product-variant-item.tsx";
import {Button} from '@/components/ui/button';
import {useProductFormContext} from '@/contexts/product-form-context.tsx';
import {useLang} from '@/lib/lang';
import {captureForRollback} from '@/lib/optimistic';
import type {ProductImage} from "@/types/models.ts";

export function ProductVariantList() {
    const {t} = useLang();
    const {
        formData,
        readOnlyData,
        duplicateGroups,
        duplicateUids,
        setVariants,
        canAddVariant,
        addVariant,
        resolveImageUrl,
        stagedImages,
        isEditMode,
    } = useProductFormContext();

    const [variantImagePicker, setVariantImagePicker] = useState<{
        open: boolean;
        variant: FormVariant | null;
    }>({open: false, variant: null});

    // In create mode, convert stagedImages to mock ProductImage[] for the picker
    const stagedAsProductImages: ProductImage[] = useMemo(() => {
        if (isEditMode) {return [];}

        return stagedImages.map((staged, index) => ({
            id: index,
            product_id: 0,
            image_id: staged.image?.id ?? 0,
            position: index + 1,
            image: staged.image ?? {
                id: 0,
                name: staged.file?.name ?? `Image ${index + 1}`,
                src: '',
                url: staged.previewUrl,
            },
        }));
    }, [isEditMode, stagedImages]);

    /**
     * Remove image from variant.
     * Optimistic: updates UI immediately, rolls back on server error.
     */
    const removeVariantImage = (variant: FormVariant) => {
        const rollback = captureForRollback(
            () => [...(formData.variants ?? [])],
            setVariants,
        );

        // Optimistic: remove image immediately
        setVariants((formData.variants ?? []).map(v =>
            v.uid === variant.uid ? {...v, image_id: null, image: undefined} : v
        ));

        if (!variant.id) {
            return; // Unsaved variant — no server call needed
        }

        router.put(
            route('admin.variants.image.set', {id: variant.id}),
            {
                product_image_id: null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    rollback();
                    toast.error(t('admin.products_edit.errors.variant_image_failed'));
                    if (import.meta.env.DEV) {
                        console.log('[ProductVariantList.removeVariantImage] Error', {variantId: variant.id});
                    }
                },
            }
        );
    };

    /**
     * Set image for variant.
     * productImageId is ProductImage.id (pivot record in product_images table).
     * Optimistic: updates UI and closes picker immediately, rolls back on server error.
     */
    const handleVariantImageSelect = (productImageId: number) => {
        if (!variantImagePicker.variant) {
            return;
        }

        const {variant} = variantImagePicker;

        const rollback = captureForRollback(
            () => [...(formData.variants ?? [])],
            setVariants,
        );

        // Optimistic: set image and close picker immediately
        setVariants((formData.variants ?? []).map(v =>
            v.uid === variant.uid ? {...v, image_id: productImageId} : v
        ));
        setVariantImagePicker({open: false, variant: null});

        if (!variant?.id) {
            return; // Unsaved variant — no server call needed
        }

        router.put(
            route('admin.variants.image.set', {id: variant.id}),
            {
                product_image_id: productImageId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    rollback();
                    toast.error(t('admin.products_edit.errors.variant_image_failed'));
                    if (import.meta.env.DEV) {
                        console.log('[ProductVariantList.handleVariantImageSelect] Error', {variantId: variant.id, productImageId});
                    }
                },
            }
        );
    };

    const variants = formData.variants ?? [];
    const images = isEditMode ? (readOnlyData.images ?? []) : stagedAsProductImages;

    return <>
        <div className="col-span-9 flex flex-col gap-5">
            <DuplicateVariantsAlert duplicateGroups={duplicateGroups}/>

            {variants.map((variant, index) => {
                return (
                    <ProductVariantItem
                        key={variant.uid}
                        variant={variant}
                        onImageRemove={() => removeVariantImage(variant)}
                        onImageSelect={() => setVariantImagePicker({open: true, variant})}
                        resolvedImageUrl={resolveImageUrl(variant)}
                        variantNumber={index + 1}
                        canRemove={variants.length > 1}
                        isDuplicate={duplicateUids.has(variant.uid)}
                    />
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
            !!images.length && (
                <ProductImagesPicker
                    currentProductImageId={variantImagePicker?.variant?.image_id ?? null}
                    open={variantImagePicker.open}
                    productImages={images}
                    onOpenChange={(open) => {
                        setVariantImagePicker({open, variant: null});
                    }}
                    onSelect={handleVariantImageSelect}
                />
            )
        }
    </>
}
