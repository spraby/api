import {useCallback} from 'react';

import {router} from '@inertiajs/react';
import {ArrowLeftIcon, CheckIcon} from 'lucide-react';
import {toast} from 'sonner';

import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductCategoryCard} from '@/components/product-category-card';
import type {CategoryWithOptions} from '@/components/product-category-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import {ProductVariantsCard} from '@/components/product-variants-card';
import {Button} from '@/components/ui/button';
import {useProductForm} from '@/hooks/use-product-form';
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

    // Count images for summary
    const imagesCount = isEdit
        ? (product.images?.length ?? 0)
        : form.localImages.length;

    const handleSubmit = useCallback(async () => {
        const isValid = form.validate();

        if (process.env.NODE_ENV !== 'production') {
            console.log('[ProductForm.handleSubmit]', {
                isEdit,
                isValid,
                variantCount: form.variants.length,
                imageCount: form.localImages.length,
            });
        }

        if (!isValid) {return;}

        const payload = form.buildSubmitPayload(isEdit);

        if (isEdit && product.id) {
            router.put(route('admin.products.update', {product: product.id}), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Продукт обновлён');
                },
                onError: (errors) => {
                    console.error('[ProductForm] update error', errors);
                    toast.error('Ошибка при сохранении');
                },
            });
        } else {
            // For create mode with local images, Inertia handles File objects in FormData
            router.post(route('admin.products.store'), payload, {
                onSuccess: () => {
                    toast.success('Продукт создан');
                },
                onError: (errors) => {
                    console.error('[ProductForm] store error', errors);
                    toast.error('Ошибка при создании');
                },
            });
        }
    }, [form, isEdit, product.id]);

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
                            {isEdit ? 'Редактирование' : 'Новый продукт'}
                        </h1>
                        {isEdit && product.title ? <p className="text-[12px] text-muted-foreground">{product.title}</p> : null}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Отмена
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="gap-2">
                        <CheckIcon className="size-4" />
                        {isEdit ? 'Сохранить' : 'Создать'}
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
