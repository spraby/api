/**
 * Product Form Component
 *
 * Handles product details, images, and variants.
 */
import {type FormEventHandler, useCallback, useEffect, useMemo, useRef} from "react";

import {useForm, router} from '@inertiajs/react';
import isEqual from 'lodash-es/isEqual';
import {
    CheckCircle2Icon,
    CircleOffIcon,
    ImagesIcon,
    LayersIcon,
} from 'lucide-react';
import {toast} from "sonner";


import {ProductFormActions} from "@/components/product-form-actions.tsx";
import {ProductFormSection} from "@/components/product-form-section.tsx";
import {ProductImagesSection} from "@/components/product-images-section.tsx";
import {ProductSettingsCard} from "@/components/product-settings-card.tsx";
import {ProductVariantList} from "@/components/product-variant-list.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {UnsavedChangesBar} from "@/components/unsaved-changes-bar.tsx";
import {useIsMobile} from '@/hooks/use-mobile';
import {useLang} from '@/lib/lang';
import {VariantService} from '@/services/variant-service';
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
    const isMobile = useIsMobile();

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

    const {data: formData, setData, errors, put, post, processing, reset} = useForm<ProductFormData>(initialFormData);
    const isEditMode = useMemo(() => !!formData?.id, [formData?.id]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [defaultProduct?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) {return null;}
        if (formData?.category_id) {
            return brandCategories.find(i => i.id === formData.category_id);
        }

        return brandCategories[0]
    }, [formData, brandCategories])

    // Track saved state for unsaved changes detection
    const savedDataRef = useRef<ProductFormData>(initialFormData);
    // Track if description has been normalized by the rich text editor
    const descriptionNormalizedRef = useRef(false);
    const hasUnsavedChanges = useMemo(() => {
        // Compare only editable fields to avoid false positives from computed properties
        const editableFields = ['title', 'description', 'enabled', 'category_id', 'variants'] as const;
        const currentData = editableFields.reduce<Record<string, unknown>>((acc, key) => ({...acc, [key]: formData[key]}), {});
        const savedData = editableFields.reduce<Record<string, unknown>>((acc, key) => ({...acc, [key]: savedDataRef.current[key]}), {});

        const hasChanges = !isEqual(currentData, savedData);

        // Debug
        if (hasChanges) {
            console.log('hasUnsavedChanges:', {
                currentData,
                savedData,
                descriptionNormalized: descriptionNormalizedRef.current,
                descriptionEqual: currentData['description'] === savedData['description'],
            });
        }

        return hasChanges;
    }, [formData]);

    // Check for duplicate variants
    const hasDuplicateVariants = useMemo(() => {
        const duplicateGroups = VariantService.findDuplicateGroups(formData.variants ?? []);

        return duplicateGroups.length > 0;
    }, [formData.variants]);

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

            return { ...variant, values: generatedValues };
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
    const submitForm = useCallback(() => {
        // Prevent saving if there are duplicate variants
        if (hasDuplicateVariants) {
            toast.error(t('admin.products_edit.errors.duplicate_variants'));

            return;
        }

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

                    // Update read-only data
                    readOnlyDataRef.current = {
                        images: updatedProduct.images ?? [],
                        externalUrl: updatedProduct.externalUrl,
                    };

                    setData(updatedFormData);
                    savedDataRef.current = updatedFormData;
                },
            });
        } else {
            post(route('admin.products.store'));
        }
    }, [hasDuplicateVariants, t, formData?.id, put, setData, post]);

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

    const variantCount = formData.variants?.length ?? 0;
    const images = readOnlyDataRef.current.images ?? [];
    const imageCount = images.length;
    const statusLabel = formData.enabled
        ? t('admin.products_table.status.enabled')
        : t('admin.products_table.status.disabled');
    const statusVariant: 'default' | 'outline' = formData.enabled ? 'default' : 'outline';

    const productTitleSummary = formData.title?.trim() || t('admin.products_edit.placeholders.title');

    const imagePreview = useMemo(() => {
        if (!isMobile) {
            return {items: [], extra: 0};
        }

        const sorted = [...images].sort((a, b) => a.position - b.position);
        const items = sorted.slice(0, 1);
        const extra = Math.max(0, sorted.length - items.length);

        return {items, extra};
    }, [images, isMobile]);

    const variantsSummaryText = useMemo(() => {
        return `+${variantCount}`;
    }, [variantCount]);

    const actionLabels = useMemo(() => {
        if (isEditMode) {
            return {
                save: t('admin.products_edit.actions.save'),
                saving: t('admin.products_edit.actions.saving'),
                cancel: t('admin.products_edit.actions.cancel'),
            };
        }

        return {
            save: t('admin.products_create.actions.create'),
            saving: t('admin.products_create.actions.creating'),
            cancel: t('admin.products_create.actions.cancel'),
        };
    }, [isEditMode, t]);

    const productInfoFields = (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
                <Label htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
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
        </div>
    );

    const imagesSection = (
        <ProductImagesSection
            title={t('admin.products_edit.sections.product_images')}
            isEditMode={isEditMode}
            processing={processing}
            images={readOnlyDataRef.current.images}
            productId={formData.id}
            emptyHint={t('admin.products_edit.hints.save_to_add_image')}
            sectionVariant={isMobile ? 'plain' : 'card'}
            hideHeader={isMobile}
        />
    );

    const variantsSection = (
        <ProductVariantList
            product={{
                id: formData.id,
                variants: formData.variants,
                images: readOnlyDataRef.current.images,
            }}
            onUpdate={v => {
                setData('variants', [...v])
            }}
            options={category?.options ?? []}
        />
    );

    const settingsSection = (
        <ProductSettingsCard
            title={t('admin.products_edit.sections.settings')}
            enabledLabel={t('admin.products_edit.fields.enabled')}
            enabledStatusLabel={t('admin.products_table.status.enabled')}
            disabledStatusLabel={t('admin.products_table.status.disabled')}
            enabled={formData.enabled}
            onEnabledChange={(value) => setData('enabled', value)}
            enabledError={errors.enabled}
            categoryLabel={t('admin.products_edit.fields.category')}
            categoryPlaceholder={t('admin.products_edit.placeholders.category')}
            categoryError={errors.category_id}
            categories={brandCategories}
            selectedCategoryId={category?.id ?? null}
            hasCategoryInList={!!category?.id}
            onCategoryChange={(value) => setData('category_id', value)}
            isCategoryLocked={isEditMode}
            categoryLockedHint={t('admin.products_edit.category.locked')}
            noCategoryMessage={t('admin.products_edit.category.not_in_list')}
            sectionVariant={isMobile ? 'plain' : 'card'}
            hideHeader={isMobile}
            className={isMobile ? 'space-y-3' : undefined}
        />
    );

    return <form className="space-y-6 pb-24 lg:space-y-8 lg:pb-0" onSubmit={onSubmit}>
        {isMobile ? (
            <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Badge className="gap-1" variant="secondary">
                        <LayersIcon className="size-3" />
                        {variantCount}
                    </Badge>
                    <Badge className="gap-1" variant="secondary">
                        <ImagesIcon className="size-3" />
                        {imageCount}
                    </Badge>
                    <Badge className="gap-1" variant={statusVariant}>
                        {formData.enabled ? <CheckCircle2Icon className="size-3" /> : <CircleOffIcon className="size-3" />}
                        {statusLabel}
                    </Badge>
                </div>

                <Accordion type="multiple" defaultValue={['info', 'variants']} className="space-y-3">
                    <AccordionItem
                        value="info"
                        className="rounded-2xl border border-border/60 bg-card/80 px-3 shadow-sm"
                    >
                        <AccordionTrigger className="group py-3 text-sm">
                            <div className="flex flex-1 flex-col items-start gap-1 text-left">
                                <span>{t('admin.products_edit.sections.product_info')}</span>
                                <span className="text-xs text-muted-foreground group-data-[state=open]:hidden">
                                    {productTitleSummary}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2">
                            {productInfoFields}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="images"
                        className="rounded-2xl border border-border/60 bg-card/80 px-3 shadow-sm"
                    >
                        <AccordionTrigger className="group py-3 text-sm">
                            <div className="flex flex-1 flex-col items-start gap-1 text-left">
                                <span>{t('admin.products_edit.sections.product_images')}</span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-data-[state=open]:hidden">
                                    {imagePreview.items.length ? (
                                        <>
                                            {imagePreview.items.map((image, index) => (
                                                <span
                                                    key={image.id ?? index}
                                                    className={`relative h-8 w-8 overflow-hidden rounded-lg border ${index === 0 ? 'border-primary ring-1 ring-primary/70' : 'border-border/70'}`}
                                                >
                                                    {image.image?.url ? (
                                                        <img
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                            src={image.image.url}
                                                        />
                                                    ) : (
                                                        <span className="block h-full w-full bg-muted/70" />
                                                    )}
                                                </span>
                                            ))}
                                            {imagePreview.extra > 0 ? (
                                                <span className="px-1 text-[11px]">+{imagePreview.extra}</span>
                                            ) : null}
                                        </>
                                    ) : (
                                        <span>{t('admin.products_edit.images.no_images')}</span>
                                    )}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2">
                            {imagesSection}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="variants"
                        className="rounded-2xl border border-border/60 bg-card/80 px-3 shadow-sm"
                    >
                        <AccordionTrigger className="group py-3 text-sm">
                            <div className="flex flex-1 flex-col items-start gap-1 text-left">
                                <span>{t('admin.products_edit.sections.variants')}</span>
                                <span className="text-xs text-muted-foreground group-data-[state=open]:hidden">
                                    {variantsSummaryText}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2">
                            {variantsSection}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="settings"
                        className="rounded-2xl border border-border/60 bg-card/80 px-3 shadow-sm"
                    >
                        <AccordionTrigger className="py-3 text-sm">
                            {t('admin.products_edit.sections.settings')}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2">
                            {settingsSection}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <p className="text-xs text-muted-foreground">
                    <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-6">
                    <ProductFormSection title={t('admin.products_edit.sections.product_info')}>
                        {productInfoFields}
                    </ProductFormSection>

                    {imagesSection}

                    <ProductFormSection
                        title={t('admin.products_edit.sections.variants')}
                        contentClassName="space-y-5"
                        action={(
                            <Badge variant="secondary" className="text-xs">
                                {variantCount}
                            </Badge>
                        )}
                    >
                        {variantsSection}
                    </ProductFormSection>
                </div>

                <div className="lg:col-span-4">
                    <div className="space-y-6 lg:sticky lg:top-20">
                        {settingsSection}
                    </div>
                </div>
            </div>
        )}

        {isMobile ? (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-sm">
                <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-3">
                    <ProductFormActions
                        className="w-full"
                        primaryClassName="flex-1"
                        secondaryClassName="flex-1"
                        cancelLabel={actionLabels.cancel}
                        saveLabel={actionLabels.save}
                        savingLabel={actionLabels.saving}
                        isSaving={processing}
                        onCancel={() => {
                            router.visit(route('admin.products'));
                        }}
                        onSave={submitForm}
                    />
                </div>
            </div>
        ) : null}

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
            saveLabel={actionLabels.save}
            onDiscard={handleDiscard}
            onSave={submitForm}
        />
    </form>;
}
