import {router} from '@inertiajs/react';

import {ProductBasicFields} from "@/components/product-basic-fields.tsx";
import {ProductCategorySelect} from "@/components/product-category-select.tsx";
import {ProductImagesManager} from "@/components/product-images-manager.tsx";
import {ProductImagesStaging} from "@/components/product-images-staging.tsx";
import {ProductVariantList} from "@/components/product-variant-list.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
import {ProductFormContext} from "@/contexts/product-form-context.tsx";
import {useProductForm} from "@/hooks/use-product-form.ts";
import {useLang} from '@/lib/lang';
import type {Product, ProductImageId} from "@/types/models.ts";

// Simplified variant type for form data (excludes nested relations that cause FormDataType issues)
export interface FormVariant {
    uid: string; // Stable identifier: stringified DB id for existing, UUID for new
    id?: number;
    product_id: number;
    image_id: ProductImageId | null; // FK to product_images table (pivot record)
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

export function ProductForm({product: defaultProduct}: { product: Product }) {
    const {t} = useLang();
    const form = useProductForm(defaultProduct);

    const {
        formData,
        readOnlyData,
        errors,
        processing,
        isEditMode,
        brandCategories,
        category,
        setTitle,
        setDescription,
        setEnabled,
        setCategoryId,
        onSubmit,
    } = form;

    return <ProductFormContext.Provider value={form}>
        <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
                <div className="col-span-1 md:col-span-9">
                    <ProductBasicFields
                        title={formData.title}
                        description={formData.description}
                        errors={errors}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                    />
                </div>

                <div className="col-span-1 md:col-span-3">
                    <ProductCategorySelect
                        enabled={formData.enabled}
                        category={category}
                        brandCategories={brandCategories}
                        isEditMode={isEditMode}
                        errors={errors}
                        onEnabledChange={setEnabled}
                        onCategoryChange={setCategoryId}
                    />
                </div>

                {formData?.id ? (
                    <Card className="col-span-9 p-4 sm:p-6">
                        <ProductImagesManager
                            disabled={processing}
                            images={readOnlyData.images}
                            productId={formData.id}
                        />
                    </Card>
                ) : (
                    <Card className="col-span-9 p-4 sm:p-6">
                        <ProductImagesStaging
                            disabled={processing}
                            stagedImages={form.stagedImages}
                            onAddUploads={form.addStagedUploads}
                            onAddExisting={form.addStagedExisting}
                            onRemove={form.removeStagedImage}
                            onReorder={form.reorderStagedImages}
                        />
                    </Card>
                )}
                {
                    (!!formData?.variants?.length) && <ProductVariantList />
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

        </form>
    </ProductFormContext.Provider>;
}
