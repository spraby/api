import {useCallback, useEffect, useState} from 'react';

import {router} from '@inertiajs/react';
import {ArrowLeftIcon, CheckIcon} from 'lucide-react';
import {toast} from 'sonner';

import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductCategoryCard} from '@/components/product-category-card';
import type {CategoryWithOptions} from '@/components/product-category-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import type {PickableImage} from '@/components/variant-image-picker-dialog';
import {ProductVariantsCard} from '@/components/product-variants-card';
import {Button} from '@/components/ui/button';
import {useProductForm} from '@/hooks/use-product-form';
import {useLang} from '@/lib/lang';
import {useSaveBar} from '@/stores/save-bar';
import type {Product} from '@/types/models';

interface Props {
    product: Product;
}

/**
 * Compute initial selectedValues for edit mode from existing variants.
 * For each option in the category, collect all distinct optionValueIds used across variants.
 */
function computeInitialSelectedValues(
    category: CategoryWithOptions | null,
    variants: {values?: {option_id: number; option_value_id: number}[]}[],
): Record<number, number[]> {
    if (!category) {return {};}

    const result: Record<number, number[]> = {};

    for (const option of category.options) {
        if (!option.id) {continue;}

        const optId = option.id;
        const usedIds = new Set<number>();

        for (const v of variants) {
            for (const vv of v.values ?? []) {
                if (vv.option_id === optId) {
                    usedIds.add(vv.option_value_id);
                }
            }
        }

        result[optId] = [...usedIds];
    }

    return result;
}

export function ProductForm({product}: Props) {
    const isEdit = !!product.id;
    const {t} = useLang();

    // Build categories with options from brand data
    const categories = (product.brand?.categories ?? []).filter(
        (c): c is CategoryWithOptions => c.id != null,
    );

    // Find current category with options
    const currentCategory = categories.find(c => c.id === product.category_id) ?? null;

    // Pre-compute selectedValues for edit mode
    const initialSelectedValues = isEdit
        ? computeInitialSelectedValues(currentCategory, product.variants ?? [])
        : {};

    const form = useProductForm({
        title: product.title,
        description: product.description,
        category_id: product.category_id,
        initialSelectedValues,
        variants: (product.variants ?? []).map(v => ({
            id: v.id,
            price: v.price,         // DB price = original/compare
            final_price: v.final_price, // DB final_price = current selling
            enabled: v.enabled,
            image_id: v.image_id ?? null,
            values: (v.values ?? []).map(vv => ({
                option_id: vv.option_id,
                option_value_id: vv.option_value_id,
            })),
        })),
    });

    // Derive category for category card
    const selectedCategory = categories.find(c => c.id === form.categoryId) ?? null;

    // Variant errors: convert errors.variants string to array
    const variantErrors = form.errors.variants ? [form.errors.variants] : [];

    const [isSaving, setIsSaving] = useState(false);

    // Edit mode: local pickable images list (initialized from product.images, grows as new images attached)
    const [localPickableImages, setLocalPickableImages] = useState<PickableImage[]>(() =>
        (product.images ?? []).map(pi => ({
            id: pi.id!,
            url: pi.image?.url,
            alt: pi.image?.alt,
            name: pi.image?.name,
        })),
    );

    // Sync localPickableImages when product.images changes (e.g. after page reload)
    useEffect(() => {
        setLocalPickableImages(
            (product.images ?? []).map(pi => ({
                id: pi.id!,
                url: pi.image?.url,
                alt: pi.image?.alt,
                name: pi.image?.name,
            })),
        );
    }, [product.images]);

    // Called when variant image picker attaches a new image to the product via API
    const handleNewImageAttached = useCallback((img: PickableImage) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[ProductForm] handleNewImageAttached', {id: img.id, url: img.url});
        }
        setLocalPickableImages(prev => {
            if (prev.find(p => p.id === img.id)) {return prev;}
            return [...prev, img];
        });
    }, []);

    // Create mode: build pickable images from staged local uploads (image_index = position in localImages)
    const createModePickableImages: PickableImage[] = form.localImages.map((img, i) => ({
        id: i,
        url: img.url,
        name: img.name,
        alt: null,
    }));

    // Count images for summary
    const imagesCount = isEdit
        ? (product.images?.length ?? 0)
        : form.localImages.length + form.libraryImages.length;

    const handleSubmit = useCallback(async (): Promise<boolean> => {
        const isValid = form.validate();

        if (process.env.NODE_ENV !== 'production') {
            console.log('[ProductForm.handleSubmit] start', {
                isEdit,
                isValid,
                variantCount: form.variants.length,
                imageCount: form.localImages.length,
                libraryImagesCount: form.libraryImages.length,
            });
        }

        if (!isValid) {return false;}

        setIsSaving(true);
        const payload = form.buildSubmitPayload(isEdit);

        return new Promise<boolean>((resolve) => {
            if (isEdit && product.id) {
                router.put(route('admin.products.update', {product: product.id}), payload, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('admin.products_edit.toast_updated'));
                        form.resetForm();
                        setIsSaving(false);
                        resolve(true);
                    },
                    onError: (errors) => {
                        console.error('[ProductForm] update error', errors);
                        toast.error(t('admin.products_edit.toast_error_save'));
                        setIsSaving(false);
                        resolve(false);
                    },
                });
            } else {
                // Capture library images before redirect (component will remount)
                const capturedLibraryImages = form.libraryImages;

                // For create mode with local images, Inertia handles File objects in FormData
                router.post(route('admin.products.store'), payload, {
                    onSuccess: (page) => {
                        toast.success(t('admin.products_create.success.created'));

                        // Attach library images after product is created (if any were selected)
                        if (capturedLibraryImages.length > 0) {
                            const newProductId = (page.props as {product?: {id?: number}}).product?.id;

                            if (newProductId) {
                                console.log('[ProductForm] attaching library images after create', {
                                    count: capturedLibraryImages.length,
                                    productId: newProductId,
                                });
                                router.post(
                                    route('admin.products.images.attach', {product: newProductId}),
                                    {image_ids: capturedLibraryImages.map(img => Number(img.uid))},
                                    {preserveScroll: true},
                                );
                            }
                        }

                        setIsSaving(false);
                        resolve(true);
                    },
                    onError: (errors) => {
                        console.error('[ProductForm] store error', errors);
                        toast.error(t('admin.products_create.toast_error_create'));
                        setIsSaving(false);
                        resolve(false);
                    },
                });
            }
        });
    }, [form, isEdit, product.id, t]);

    const handleDiscard = useCallback(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[ProductForm] SaveBar onDiscard triggered');
        }

        form.resetForm();
    }, [form]);

    useSaveBar({
        hasChanges: form.isDirty,
        isSaving,
        onSave: handleSubmit,
        onDiscard: handleDiscard,
    });

    const handleCancel = () => {
        router.visit(route('admin.products'));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex size-9 items-center justify-center rounded-[10px] border border-border text-muted-foreground hover:bg-muted"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold">
                            {isEdit ? t('admin.products_edit.title') : t('admin.products_create.title')}
                        </h1>
                        {isEdit && product.title ? <p className="text-[12px] text-muted-foreground">{product.title}</p> : null}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        {t('admin.products_edit.actions.cancel')}
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="gap-2">
                        <CheckIcon className="size-4" />
                        {isEdit ? t('admin.products_edit.actions.save') : t('admin.products_create.actions.create')}
                    </Button>
                </div>
            </div>

            {/* ── Two-column grid ─────────────────────────────────────────── */}
            <div
                className="grid gap-4"
                style={{gridTemplateColumns: '1fr 340px'}}
            >
                {/* Left column */}
                <div className="flex flex-col gap-4">
                    <ProductBasicFieldsCard
                        title={form.title}
                        description={form.description}
                        errors={form.errors}
                        onChange={(field, value) => {
                            if (field === 'title') {form.setTitle(value);}
                            else {form.setDescription(value);}
                        }}
                    />

                    <ProductCategoryCard
                        categories={categories}
                        categoryId={form.categoryId}
                        selectedValues={form.selectedValues}
                        error={form.errors.category_id}
                        onSelectCategory={form.selectCategory}
                        onToggleOptionValue={form.toggleOptionValue}
                        onSelectAllValues={form.selectAllValues}
                        onDeselectAllValues={form.deselectAllValues}
                        onGenerateVariants={() => {
                            if (selectedCategory) {
                                form.generateVariants(selectedCategory);
                            }
                        }}
                        combinationCount={form.computeCombinationCount(selectedCategory)}
                    />

                    {form.categoryId !== null && (
                        <ProductVariantsCard
                            variants={form.variants}
                            options={selectedCategory?.options ?? []}
                            categoryId={form.categoryId}
                            variantErrors={variantErrors}
                            pickableImages={isEdit ? localPickableImages : createModePickableImages}
                            productId={isEdit ? product.id : undefined}
                            isEdit={isEdit}
                            onNewImageAttached={handleNewImageAttached}
                            onUpdate={(key, patch) => form.updateVariant(key, patch)}
                            onDelete={(key) => form.deleteVariant(key)}
                            onAdd={(values) => form.addVariant(values)}
                            onBulkPricing={(price, comparePrice) =>
                                form.applyBulkPricing(price, comparePrice)
                            }
                        />
                    )}
                </div>

                {/* Right column — sticky */}
                <div
                    className="flex flex-col gap-4"
                    style={{position: 'sticky', top: '20px', alignSelf: 'start'}}
                >
                    <ProductImagesCard
                        product={product}
                        isEdit={isEdit}
                        localImages={form.localImages}
                        onLocalImagesAdd={form.addLocalImages}
                        onLocalImageRemove={form.removeLocalImage}
                        onLocalImageMakeFirst={form.makeLocalImageFirst}
                        libraryImages={form.libraryImages}
                        onLibraryImagesAdd={form.addLibraryImages}
                        onLibraryImageRemove={form.removeLibraryImage}
                    />

                    <ProductSummaryCard
                        title={form.title}
                        categoryName={selectedCategory?.name ?? null}
                        imagesCount={imagesCount}
                        variants={form.variants}
                    />
                </div>
            </div>
        </div>
    );
}
