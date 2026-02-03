/**
 * Variant Option Selector Component
 *
 * Allows selecting option values for a product variant based on category options
 */
import {type FormEventHandler, useCallback, useEffect, useMemo, useRef} from "react";

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
import {UnsavedChangesBar} from "@/components/unsaved-changes-bar.tsx";
import {useLang} from '@/lib/lang';
import {VariantService} from '@/services/variant-service';
import type {Product} from "@/types/models.ts";


export function ProductForm({product: defaultProduct}: { product: Product }) {
    const {t} = useLang();

    const {data: product, setData, errors, put, post, processing, reset} = useForm(defaultProduct);
    const isEditMode = useMemo(() => !!product?.id, [product?.id]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [defaultProduct?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) {return null;}
        if (product?.category_id) {
            return brandCategories.find(i => i.id === product.category_id);
        }

        return brandCategories[0]
    }, [product, brandCategories])

    // Track saved state for unsaved changes detection
    const savedDataRef = useRef(defaultProduct);
    const hasUnsavedChanges = useMemo(() => {
        // Compare only editable fields to avoid false positives from computed properties
        const editableFields = ['title', 'description', 'enabled', 'category_id', 'variants'] as const;
        const currentData = editableFields.reduce((acc, key) => ({...acc, [key]: product[key]}), {});
        const savedData = editableFields.reduce((acc, key) => ({...acc, [key]: savedDataRef.current[key]}), {});

        const hasChanges = !isEqual(currentData, savedData);

        // Debug: uncomment to see what's different
        if (hasChanges) {
            console.log('Unsaved changes detected:', {currentData, savedData});
        }

        return hasChanges;
    }, [product]);

    // Check for duplicate variants
    const hasDuplicateVariants = useMemo(() => {
        const duplicateGroups = VariantService.findDuplicateGroups(product.variants ?? []);

        return duplicateGroups.length > 0;
    }, [product.variants]);

    // Track if variant values have been initialized to prevent overwriting user changes
    const variantsInitialized = useRef(false);

    useEffect(() => {
        if (!product?.category_id && !!category?.id) {
            setData('category_id', category.id);
            savedDataRef.current = {...savedDataRef.current, category_id: category.id};
        }
    }, [product?.category_id, category?.id, setData]);

    // Auto-generate variant values ONLY on initial load (not on every change)
    useEffect(() => {
        // Skip if already initialized or no data
        if (variantsInitialized.current || !category?.options?.length || !product?.variants?.length) {
            return;
        }

        let hasChanges = false;

        const updatedVariants = product.variants.map((variant, index) => {
            // Skip variants that already have an ID (existing variants)
            if (variant?.id) {
                return variant;
            }

            // Skip variants that already have values (user might have set them)
            if (variant.values && variant.values.length > 0) {
                return variant;
            }

            // Get all other variants (excluding current one being processed)
            const otherVariants = (product.variants ?? []).filter((_, i) => i !== index);

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

            return { ...variant, values: generatedValues };
        });

        if (hasChanges) {
            setData('variants', updatedVariants);
            // Also update savedDataRef so auto-generated values don't trigger unsaved changes
            savedDataRef.current = {...savedDataRef.current, variants: updatedVariants};
            variantsInitialized.current = true; // Mark as initialized
        }
    }, [category, product.variants, setData]);

    /**
     * Handle form submission with duplicate validation
     */
    const submitForm = useCallback(() => {
        // Prevent saving if there are duplicate variants
        if (hasDuplicateVariants) {
            toast.error(t('admin.products_edit.errors.duplicate_variants'));

            return;
        }

        if (product?.id) {
            put(route('admin.products.update', product.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedProduct = page.props['product'] as Product;

                    setData(updatedProduct);
                    savedDataRef.current = updatedProduct;
                },
            });
        } else {
            post(route('admin.products.store'));
        }
    }, [hasDuplicateVariants, t, product?.id, put, setData, post]);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        submitForm();
    }

    /**
     * Discard unsaved changes
     */
    const handleDiscard = useCallback(() => {
        reset();
        setData(savedDataRef.current);
    }, [reset, setData]);

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
                            value={product.title}
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
                            value={product.description ?? ''}
                            onChange={v => setData('description', v)}
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
                                checked={product.enabled}
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
                !!product?.id &&
                <Card className="col-span-9 p-4 sm:p-6">
                    <ProductImagesManager
                        disabled={processing}
                        images={product.images || []}
                        productId={product?.id}
                    />
                </Card>
            }
            {
                (!!product?.variants?.length) && <ProductVariantList
                    product={product}
                    onUpdate={v => {
                        setData('variants', [...v])
                    }}
                    options={category?.options ?? []}
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

        <UnsavedChangesBar
            dialogCancelLabel={t('admin.products_edit.unsaved.dialog.cancel')}
            dialogDescription={t('admin.products_edit.unsaved.dialog.description')}
            dialogDiscardLabel={t('admin.products_edit.unsaved.dialog.discard')}
            dialogSaveLabel={t('admin.products_edit.unsaved.dialog.save')}
            dialogTitle={t('admin.products_edit.unsaved.dialog.title')}
            discardLabel={t('admin.products_edit.actions.discard')}
            hasChanges={hasUnsavedChanges}
            isSaving={processing}
            message={t('admin.products_edit.unsaved.message')}
            mobileMessage={t('admin.products_edit.unsaved.mobile_message')}
            saveLabel={t('admin.products_edit.actions.save')}
            onDiscard={handleDiscard}
            onSave={submitForm}
        />
    </form>;
}
