/**
 * Variant Option Selector Component
 *
 * Allows selecting option values for a product variant based on category options
 */
import {type FormEventHandler, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {useForm, router} from '@inertiajs/react';
import isEqual from 'lodash-es/isEqual';
import {toast} from "sonner";


import {ProductImagesManager} from "@/components/product-images-manager.tsx";
import {ProductVariantList} from "@/components/product-variant-list.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {useLang} from '@/lib/lang';
import {VariantService} from '@/services/variant-service';
import {useSaveBar} from '@/stores/save-bar';
import type {Product, ProductImage, Variant} from "@/types/models.ts";

// Simplified variant type for form data (excludes nested relations that cause FormDataType issues)
interface FormVariant {
    id?: number;
    _tempId?: string;
    product_id: number;
    image_id: number | null;
    title: string | null;
    price: string;
    final_price: string;
    enabled: boolean;
    values?: {
        variant_id?: number;
        option_id: number;
        option_value_id: number;
    }[];
}

// Form-specific type that only includes editable fields to avoid Inertia FormDataType issues
// with deeply nested relations (brand.settings[].data: Record<string, unknown>)
interface ProductFormData {
    id?: number;
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    enabled: boolean;
    variants: FormVariant[];
}

// Read-only data passed from server (not part of form submission)
interface ProductReadOnlyData {
    images: ProductImage[];
    externalUrl?: string;
}

// Convert full Variant to simplified FormVariant
function toFormVariant(variant: Variant): FormVariant {
    return {
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

export function ProductForm({product: defaultProduct}: { product: Product }) {
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
    const [readOnlyData, setReadOnlyData] = useState<ProductReadOnlyData>({
        images: defaultProduct.images ?? [],
        externalUrl: defaultProduct.externalUrl,
    });

    const {data: formData, setData, errors, put, post, processing} = useForm<ProductFormData>(initialFormData);
    const isEditMode = useMemo(() => !!formData?.id, [formData?.id]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [defaultProduct?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) {return null;}
        if (formData?.category_id) {
            return brandCategories.find(i => i.id === formData.category_id);
        }

        return brandCategories[0]
    }, [formData.category_id, brandCategories])

    // Track saved state for unsaved changes detection
    const savedDataRef = useRef<ProductFormData>(initialFormData);
    // Track if description has been normalized by the rich text editor
    const descriptionNormalizedRef = useRef(false);
    const hasUnsavedChanges = useMemo(() => {
        const editableFields = ['title', 'description', 'enabled', 'category_id', 'variants'] as const;
        const currentData = editableFields.reduce<Record<string, unknown>>((acc, key) => ({...acc, [key]: formData[key]}), {});
        const savedData = editableFields.reduce<Record<string, unknown>>((acc, key) => ({...acc, [key]: savedDataRef.current[key]}), {});

        return !isEqual(currentData, savedData);
    }, [formData]);

    // Check for duplicate variants — keep full array for passing to variant list
    const duplicateGroups = useMemo(() => {
        return VariantService.findDuplicateGroups(formData.variants ?? []);
    }, [formData.variants]);

    const hasDuplicateVariants = duplicateGroups.length > 0;

    // Track if variant values have been initialized to prevent overwriting user changes
    const variantsInitialized = useRef(false);

    useEffect(() => {
        if (!formData?.category_id && !!category?.id) {
            setData('category_id', category.id);
            savedDataRef.current = {...savedDataRef.current, category_id: category.id};
        }
    }, [formData?.category_id, category?.id, setData]);

    // Auto-generate variant values ONLY on initial load (not on every change)
    useEffect(() => {
        // Skip if already initialized or no data
        if (variantsInitialized.current || !category?.options?.length || !formData?.variants?.length) {
            return;
        }

        let hasChanges = false;

        const updatedVariants = formData.variants.map((variant, index) => {
            // Skip variants that already have an ID (existing variants)
            if (variant?.id) {
                return variant;
            }

            // Skip variants that already have values (user might have set them)
            if (variant.values && variant.values.length > 0) {
                return variant;
            }

            // Get all other variants (excluding current one being processed)
            const otherVariants = (formData.variants ?? []).filter((_, i) => i !== index);

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
            variantsInitialized.current = true; // Mark as initialized
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

                        setReadOnlyData({
                            images: updatedProduct.images ?? [],
                            externalUrl: updatedProduct.externalUrl,
                        });

                        setData(updatedFormData);
                        savedDataRef.current = updatedFormData;
                        resolve(true);
                    },
                    onError: () => resolve(false),
                });
            } else {
                post(route('admin.products.store'), {
                    onSuccess: () => resolve(true),
                    onError: () => resolve(false),
                });
            }
        });
    }, [hasDuplicateVariants, t, formData?.id, put, setData, post]);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        void submitForm();
    }

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

    return <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            <div className="col-span-1 md:col-span-9">
                <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
                    <div className="col-span-12 gap-2 flex flex-col">
                        <Label className="flex items-center gap-1" htmlFor="title">
                            {t('admin.products_edit.fields.title')}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            required
                            id="title"
                            placeholder={t('admin.products_edit.placeholders.title')}
                            type="text"
                            value={formData.title}
                            onChange={e => setData('title', e.target.value)}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>
                    <div className="col-span-12 gap-2 flex flex-col">
                        <Label
                            htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                        <RichTextEditor
                            placeholder={t('admin.products_edit.placeholders.description')}
                            value={formData.description ?? ''}
                            onChange={v => {
                                // On first change, update savedDataRef with normalized HTML
                                // to avoid false positive unsaved changes detection
                                if (!descriptionNormalizedRef.current) {
                                    descriptionNormalizedRef.current = true;
                                    savedDataRef.current = {...savedDataRef.current, description: v};
                                }
                                setData('description', v);
                            }}
                        />
                        {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>
                </Card>
            </div>

            <div className="col-span-1 md:col-span-3">
                <Card className="flex flex-col gap-4 md:gap-5 rounded-lg border bg-card p-4 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={formData.enabled}
                                id="enabled"
                                onCheckedChange={v => setData('enabled', v as boolean)}
                            />
                            <Label className="cursor-pointer" htmlFor="enabled">
                                {t('admin.products_edit.fields.enabled')}
                            </Label>
                        </div>
                        {!!errors.enabled && <p className="text-xs text-destructive">{errors.enabled}</p>}
                    </div>
                    {
                        category?.id ?
                            <div className="gap-2 flex flex-col">
                                <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                                <Select
                                    disabled={isEditMode}
                                    value={category.id.toString()}
                                    onValueChange={(value) => {
                                        if (!value?.length) {
                                            return;
                                        }
                                        setData('category_id', Number(value));
                                    }}
                                >
                                    <SelectTrigger
                                        id="category"
                                        className={errors.category_id ? 'border-destructive' : ''}
                                    >
                                        <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandCategories.map((category) => (
                                            category?.id ?
                                                <SelectItem key={category.id} value={category?.id.toString()}>
                                                    {category.name}
                                                </SelectItem> : null
                                        ))}
                                    </SelectContent>
                                </Select>


                                {!!errors.category_id &&
                                    <p className="text-xs text-destructive">{errors.category_id}</p>}
                                {!isEditMode && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.products_edit.category.locked')}
                                    </p>
                                )}

                            </div> :
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {t('admin.products_edit.category.not_in_list')}
                                </AlertDescription>
                            </Alert>
                    }
                </Card>
            </div>

            {
                !!formData?.id &&
                <Card className="col-span-9 p-4 sm:p-6">
                    <ProductImagesManager
                        disabled={processing}
                        images={readOnlyData.images}
                        productId={formData.id}
                    />
                </Card>
            }
            {
                (!!formData?.variants?.length) && <ProductVariantList
                    product={{
                        id: formData.id,
                        variants: formData.variants,
                        images: readOnlyData.images,
                    }}
                    onUpdate={v => {
                        setData('variants', [...v])
                    }}
                    options={category?.options ?? []}
                    duplicateGroups={duplicateGroups}
                />
            }

        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
            </p>
            <Button
                className="w-full sm:w-auto"
                disabled={processing}
                type="button"
                variant="outline"
                onClick={() => {
                    router.visit(route('admin.products'));
                }}
            >
                {t('admin.products_edit.actions.cancel')}
            </Button>
        </div>

    </form>;
}
