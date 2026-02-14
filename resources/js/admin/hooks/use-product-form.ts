import {type FormEventHandler, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {router, useForm} from '@inertiajs/react';
import {toast} from "sonner";

import type {FormVariant} from "@/components/product-form.tsx";
import {hasFormChanged} from '@/lib/form-comparison';
import {useLang} from '@/lib/lang';
import {VariantService} from '@/services/variant-service';
import {useSaveBar} from '@/stores/save-bar';
import type {Image, Option, Product, ProductImage, StagedImage, Variant} from "@/types/models.ts";

// Form-specific type that only includes editable fields to avoid Inertia FormDataType issues
// with deeply nested relations (brand.settings[].data: Record<string, unknown>)
export interface ProductFormData {
    id?: number;
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    enabled: boolean;
    variants: FormVariant[];
}

// Read-only data passed from server (not part of form submission)
export interface ProductReadOnlyData {
    images: ProductImage[];
    externalUrl?: string;
}

// Convert full Variant to simplified FormVariant
function toFormVariant(variant: Variant): FormVariant {
    return {
        uid: variant.id != null ? String(variant.id) : crypto.randomUUID(),
        id: variant.id,
        product_id: variant.product_id,
        image_id: variant.image_id,
        title: variant.title,
        price: variant.price,
        final_price: variant.final_price,
        enabled: variant.enabled,
        values: variant.values?.map(v => ({
            variant_id: v.variant_id,
            option_id: v.option_id,
            option_value_id: v.option_value_id,
        })),
    };
}

// Convert full Variant array to FormVariant array
function toFormVariants(variants?: Variant[]): FormVariant[] {
    return (variants ?? []).map(toFormVariant);
}

export function useProductForm(defaultProduct: Product) {
    const {t} = useLang();

    const initialFormData: ProductFormData = {
        id: defaultProduct.id,
        brand_id: defaultProduct.brand_id,
        category_id: defaultProduct.category_id,
        title: defaultProduct.title,
        description: defaultProduct.description,
        enabled: defaultProduct.enabled,
        variants: toFormVariants(defaultProduct.variants),
    };

    // Read-only data (kept outside form state, updated on server response)
    const readOnlyDataRef = useRef<ProductReadOnlyData>({
        images: defaultProduct.images ?? [],
        externalUrl: defaultProduct.externalUrl,
    });

    const {data: formData, setData, errors, put, processing} = useForm<ProductFormData>(initialFormData);
    const isEditMode = useMemo(() => !!formData?.id, [formData?.id]);

    // Staged images state (create mode only — before product exists in DB)
    const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [defaultProduct?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) {return null;}
        if (formData?.category_id) {
            return brandCategories.find(i => i.id === formData.category_id);
        }

        return brandCategories[0]
    }, [formData.category_id, brandCategories]);

    // Track saved state for unsaved changes detection
    const savedDataRef = useRef<ProductFormData>(initialFormData);
    const hasUnsavedChanges = useMemo(() => {
        return hasFormChanged(savedDataRef.current, formData);
    }, [formData]);

    // Check for duplicate variants — index-based groups for alert display, uid set for per-variant highlight
    const duplicateGroups = useMemo(() => {
        return VariantService.findDuplicateGroups(formData.variants ?? []);
    }, [formData.variants]);

    const duplicateUids = useMemo(() => {
        const uids = new Set<string>();
        const variants = formData.variants ?? [];

        for (const group of duplicateGroups) {
            for (const index of group) {
                const uid = variants[index]?.uid;

                if (uid) {uids.add(uid);}
            }
        }

        return uids;
    }, [duplicateGroups, formData.variants]);

    const hasDuplicateVariants = duplicateGroups.length > 0;

    useEffect(() => {
        if (!formData?.category_id && !!category?.id) {
            setData('category_id', category.id);
            savedDataRef.current = {...savedDataRef.current, category_id: category.id};
        }
    }, [formData?.category_id, category?.id, setData]);

    // Auto-generate variant values for new variants without values.
    // Skips variants that already have an ID or values (idempotent — no guard ref needed).
    useEffect(() => {
        if (!category?.options?.length || !formData?.variants?.length) {
            return;
        }

        let hasChanges = false;

        const updatedVariants = formData.variants.map((variant) => {
            // Skip saved variants (already have values from server)
            if (variant?.id) {
                return variant;
            }

            // Skip variants that already have values (user or previous run set them)
            if (variant.values && variant.values.length > 0) {
                return variant;
            }

            // Get all other variants (excluding current one by uid)
            const otherVariants = (formData.variants ?? []).filter(v => v.uid !== variant.uid);

            // Generate first unique combination for this variant
            const generatedValues = VariantService.generateVariantValues(
                category.options ?? [],
                otherVariants
            );

            // If no available combinations, keep variant as is
            if (!generatedValues) {
                return variant;
            }

            hasChanges = true;

            const title = VariantService.generateTitle(generatedValues, category.options ?? []);

            return { ...variant, values: generatedValues, title };
        });

        if (hasChanges) {
            setData('variants', updatedVariants);
            // Also update savedDataRef so auto-generated values don't trigger unsaved changes
            savedDataRef.current = {...savedDataRef.current, variants: updatedVariants};
        }
    }, [category, formData.variants, setData]);

    /**
     * Handle form submission with duplicate validation
     */
    const submitForm = useCallback(async (): Promise<boolean> => {
        if (hasDuplicateVariants) {
            toast.error(t('admin.products_edit.errors.duplicate_variants'));

            return false;
        }

        return new Promise((resolve) => {
            // uid is automatically stripped by Laravel's $request->validated() — no client-side stripping needed

            if (formData?.id) {
                put(route('admin.products.update', formData.id), {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const updatedProduct = page.props['product'] as Product;
                        const updatedFormData: ProductFormData = {
                            id: updatedProduct.id,
                            brand_id: updatedProduct.brand_id,
                            category_id: updatedProduct.category_id,
                            title: updatedProduct.title,
                            description: updatedProduct.description,
                            enabled: updatedProduct.enabled,
                            variants: toFormVariants(updatedProduct.variants),
                        };

                        readOnlyDataRef.current = {
                            images: updatedProduct.images ?? [],
                            externalUrl: updatedProduct.externalUrl,
                        };

                        setData(updatedFormData);
                        savedDataRef.current = updatedFormData;
                        resolve(true);
                    },
                    onError: (errors) => {
                        toast.error(t('admin.products_edit.errors.save_failed'));
                        if (import.meta.env.DEV) {
                            console.log('[ProductForm.submit] Update error', { errors });
                        }
                        resolve(false);
                    },
                });
            } else {
                // Create mode: build data with staged images for multipart upload
                const uploadFiles: File[] = [];
                const existingIds: number[] = [];
                const imageOrder: string[] = [];

                let uploadIdx = 0;
                let existingIdx = 0;

                for (const staged of stagedImages) {
                    if (staged.type === 'upload' && staged.file) {
                        imageOrder.push(`upload:${uploadIdx}`);
                        uploadFiles.push(staged.file);
                        uploadIdx++;
                    } else if (staged.type === 'existing' && staged.image?.id) {
                        imageOrder.push(`existing:${existingIdx}`);
                        existingIds.push(staged.image.id);
                        existingIdx++;
                    }
                }

                // Convert variant image_id (staged index) → image_index for backend
                const variantsForSubmit = (formData.variants ?? []).map(v => {
                    const {image_id: imageRef, ...rest} = v;

                    return {
                        ...rest,
                        image_index: imageRef != null ? imageRef : undefined,
                    };
                });

                const createData: Record<string, unknown> = {
                    title: formData.title,
                    description: formData.description,
                    enabled: formData.enabled,
                    category_id: formData.category_id,
                    variants: variantsForSubmit,
                };

                if (uploadFiles.length > 0) {
                    createData.images = uploadFiles;
                }
                if (existingIds.length > 0) {
                    createData.existing_image_ids = existingIds;
                }
                if (imageOrder.length > 0) {
                    createData.image_order = imageOrder;
                }

                router.post(route('admin.products.store'), createData, {
                    onSuccess: () => resolve(true),
                    onError: (errors) => {
                        toast.error(t('admin.products_edit.errors.save_failed'));
                        if (import.meta.env.DEV) {
                            console.log('[ProductForm.submit] Create error', { errors });
                        }
                        resolve(false);
                    },
                });
            }
        });
    }, [hasDuplicateVariants, t, formData, put, setData, stagedImages]);

    /**
     * Discard unsaved changes
     */
    const handleDiscard = useCallback(() => {
        setData(savedDataRef.current);
    }, [setData]);

    useSaveBar({
        hasChanges: hasUnsavedChanges,
        isSaving: processing,
        onSave: submitForm,
        onDiscard: handleDiscard,
    });

    // Field-specific setters
    const setTitle = useCallback((title: string) => {
        setData('title', title);
    }, [setData]);

    const setDescription = useCallback((description: string) => {
        setData('description', description);
    }, [setData]);

    const setEnabled = useCallback((enabled: boolean) => {
        setData('enabled', enabled);
    }, [setData]);

    const setCategoryId = useCallback((categoryId: number) => {
        setData('category_id', categoryId);
    }, [setData]);

    const setVariants = useCallback((variants: FormVariant[]) => {
        setData('variants', [...variants]);
    }, [setData]);

    const onSubmit: FormEventHandler = useCallback((e) => {
        e.preventDefault();
        void submitForm();
    }, [submitForm]);

    // Variant-specific operations (used by child components via context)
    const options: Option[] = useMemo(() => category?.options ?? [], [category?.options]);

    const updateVariant = useCallback((uid: string, changes: Partial<FormVariant>) => {
        setData('variants', (formData.variants ?? []).map(v =>
            v.uid === uid ? {...v, ...changes} : v
        ));
    }, [formData.variants, setData]);

    const removeVariant = useCallback((uid: string) => {
        setData('variants', (formData.variants ?? []).filter(v => v.uid !== uid));
    }, [formData.variants, setData]);

    const updateVariantOptionValue = useCallback((uid: string, optionId: number, optionValueId: number) => {
        setData('variants', (formData.variants ?? []).map(v => {
            if (v.uid !== uid) {return v;}

            const updatedValues = [...(v.values ?? [])];
            const existingIdx = updatedValues.findIndex(val => val.option_id === optionId);

            if (existingIdx >= 0) {
                updatedValues[existingIdx] = {
                    ...updatedValues[existingIdx],
                    variant_id: v.id ?? 0,
                    option_id: optionId,
                    option_value_id: optionValueId,
                };
            } else {
                updatedValues.push({
                    variant_id: v.id ?? 0,
                    option_id: optionId,
                    option_value_id: optionValueId,
                });
            }

            return {...v, values: updatedValues};
        }));
    }, [formData.variants, setData]);

    const canAddVariant = useMemo(() => {
        return VariantService.hasAvailableCombinations(options, formData.variants ?? []);
    }, [options, formData.variants]);

    const addVariant = useCallback(() => {
        const result = VariantService.generateVariant(options, formData.variants ?? []);

        if (!result) {return;}

        const newVariant: FormVariant = {
            uid: crypto.randomUUID(),
            product_id: formData.id ?? 0,
            title: result.title,
            price: '0.00',
            final_price: '0.00',
            enabled: false,
            image_id: null,
            values: result.values,
        };

        if (import.meta.env.DEV) {
            console.log('[VariantUID] New variant created', { uid: newVariant.uid, title: newVariant.title });
        }

        setData('variants', [...(formData.variants ?? []), newVariant]);
    }, [options, formData.variants, formData.id, setData]);

    // ========================================
    // Staged Images (create mode only)
    // ========================================

    const addStagedUploads = useCallback((files: File[]) => {
        const newImages: StagedImage[] = files.map(file => ({
            tempId: crypto.randomUUID(),
            type: 'upload' as const,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setStagedImages(prev => [...prev, ...newImages]);
    }, []);

    const addStagedExisting = useCallback((images: Image[]) => {
        const newImages: StagedImage[] = images.map(img => ({
            tempId: crypto.randomUUID(),
            type: 'existing' as const,
            image: img,
            previewUrl: img.url,
        }));

        setStagedImages(prev => [...prev, ...newImages]);
    }, []);

    const removeStagedImage = useCallback((tempId: string) => {
        setStagedImages(prev => {
            const removed = prev.find(img => img.tempId === tempId);

            if (removed?.type === 'upload' && removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            return prev.filter(img => img.tempId !== tempId);
        });
        // Clear variant image references pointing to the removed image
        const removedIndex = stagedImages.findIndex(img => img.tempId === tempId);

        if (removedIndex >= 0) {
            setData('variants', (formData.variants ?? []).map(v => {
                if (v.image_id === removedIndex) {
                    return { ...v, image_id: null };
                }
                // Shift down indices above the removed one
                if (v.image_id != null && v.image_id > removedIndex) {
                    return { ...v, image_id: v.image_id - 1 };
                }

                return v;
            }));
        }
    }, [stagedImages, formData.variants, setData]);

    const reorderStagedImages = useCallback((tempIds: string[]) => {
        setStagedImages(prev => {
            const map = new Map(prev.map(img => [img.tempId, img]));

            return tempIds.map(id => map.get(id)).filter(Boolean) as StagedImage[];
        });
    }, []);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            stagedImages.forEach(img => {
                if (img.type === 'upload' && img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl);
                }
            });
        };
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resolveImageUrl = useCallback((variant: FormVariant): string | undefined => {
        // Create mode: variant.image_id stores staged image index
        if (!formData.id && variant.image_id != null && stagedImages.length > 0) {
            const staged = stagedImages[variant.image_id];

            return staged?.previewUrl;
        }

        // Saved variant may have the full image relation loaded from server
        const variantData = variant as unknown as Record<string, unknown>;
        const nestedImage = (variantData['image'] as Record<string, unknown> | undefined);
        const baseImage = (nestedImage?.['image'] as Record<string, unknown> | undefined);

        if (typeof baseImage?.['url'] === 'string') {
            return baseImage['url'];
        }
        // Match variant.image_id (ProductImageId) against ProductImage.id
        if (variant.image_id && readOnlyDataRef.current.images?.length) {
            const productImage = readOnlyDataRef.current.images.find(pi => pi.id === variant.image_id);

            return productImage?.image?.url;
        }

        return undefined;
    }, [formData.id, stagedImages]);

    return {
        formData,
        readOnlyData: readOnlyDataRef.current,
        errors,
        processing,
        isEditMode,
        brandCategories,
        category,
        options,
        duplicateGroups,
        duplicateUids,
        setTitle,
        setDescription,
        setEnabled,
        setCategoryId,
        setVariants,
        onSubmit,
        // Variant operations
        updateVariant,
        removeVariant,
        updateVariantOptionValue,
        addVariant,
        canAddVariant,
        resolveImageUrl,
        // Staged images (create mode)
        stagedImages,
        addStagedUploads,
        addStagedExisting,
        removeStagedImage,
        reorderStagedImages,
    };
}
