import {useCallback, useEffect, useMemo, useState} from 'react';

import {router} from '@inertiajs/react';
import {isEqual} from 'lodash-es';
import {v4 as uuidv4} from 'uuid';

import {CategoryVariantsGenerator} from "@/components/category-variants-generator.tsx";
import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import {VariantList} from "@/components/variant-list.tsx";
import {useSaveBar} from '@/stores/save-bar';
import type {Product, ProductImage} from '@/types/data';



export function ProductForm({product: defaultProduct}: {
    product: Product
}) {
    const isEdit = !!defaultProduct.id;
    const categories = defaultProduct.brand?.categories ?? [];

    const [product, setProduct] = useState<Product>(defaultProduct)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setProduct(defaultProduct);
        setErrors({});
    }, [defaultProduct]);

    const hasChanges = useMemo(() => {
        return !isEqual(product, defaultProduct);
    }, [product, defaultProduct]);

    const images = useMemo(() => product.images ?? [], [product.images]);
    const variants = useMemo(() => product.variants ?? [], [product.variants]);

    const onChange = useCallback((value: Partial<Product>) => {
        setProduct(v => ({...v, ...value}));
    }, []);

    const addUniqueImages = useCallback((existingImages: ProductImage[], newImages: ProductImage[]) => {
        const existingIds = new Set(existingImages.map(i => i.image_id));
        const unique = newImages.filter(img => !existingIds.has(img.image_id));

        return unique.length > 0 ? [...existingImages, ...unique] : existingImages;
    }, []);

    const buildPayload = useCallback(() => {
        const existingImageIds = images.map(pi => pi.image_id);

        const variantPayloads = variants.map(v => {
            let imageIndex: number | null = null;

            if (v.image?.image_id) {
                const idx = images.findIndex(pi => pi.image_id === v.image?.image_id);

                if (idx >= 0) {imageIndex = idx;}
            }

            return {
                ...(isEdit && v.id ? {id: v.id} : {}),
                title: v.title ?? '',
                price: Number(v.price) || 0,
                final_price: Number(v.final_price) || 0,
                enabled: v.enabled ?? true,
                image_index: imageIndex,
                values: (v.values ?? [])
                    .filter(val => val.option_id && (val.option_value_id ?? val.value?.id))
                    .map(val => ({
                        option_id: val.option_id as number,
                        option_value_id: val.option_value_id ?? val.value?.id,
                    })),
            };
        });

        const payload: Record<string, unknown> = {
            title: product.title,
            description: product.description,
            enabled: product.enabled,
            category_id: product.category?.id ?? product.category_id,
        };

        if (existingImageIds.length > 0) {
            payload.existing_image_ids = existingImageIds;
        }

        if (!isEdit && existingImageIds.length > 0 ) {
            payload.image_order = existingImageIds.map((_, i) => `existing:${i}`);
        }

        if (variantPayloads.length > 0) {
            payload.variants = variantPayloads;
        }

        return payload;
    }, [product, images, variants, isEdit]);

    const handleSubmit = useCallback(async (): Promise<boolean> => {
        const payload = buildPayload();

        setSubmitting(true);

        return new Promise<boolean>((resolve) => {
            const callbacks = {
                onError: (err: Record<string, string>) => {
                    setErrors(err);
                    resolve(false);
                },
                onSuccess: () => resolve(true),
                onFinish: () => setSubmitting(false),
            };

            if (isEdit && product.id) {
                router.put(route('admin.products.update', product.id), payload, callbacks);
            } else {
                router.post(route('admin.products.store'), payload, callbacks);
            }
        });
    }, [buildPayload, isEdit, product.id]);

    const handleDiscard = useCallback(() => {
        setProduct(defaultProduct);
        setErrors({});
    }, [defaultProduct]);

    useSaveBar({
        hasChanges,
        isSaving: submitting,
        onSave: handleSubmit,
        onDiscard: handleDiscard,
    });

    return (
        <div
            className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_340px]"
        >
            <div className="flex flex-col gap-4">
                <ProductBasicFieldsCard
                    title={product.title}
                    description={product.description}
                    errors={errors}
                    onChange={(field, value) => {
                        onChange({[field]: value})
                    }}
                />

                {
                    !product?.id &&
                    <CategoryVariantsGenerator
                        categories={categories}
                        selectedCategoryId={product.category?.id ?? null}
                        hasVariants={variants.length > 1}
                        onSelect={(category, variant) => {
                            onChange({category, variants: [variant]});
                        }}
                    />
                }

                <VariantList
                    variants={variants}
                    images={images}
                    options={product?.category?.options ?? []}
                    onChange={(updatedVariants) => {
                        const variantImages = updatedVariants
                            .map(v => v.image)
                            .filter((img): img is ProductImage => !!img);

                        onChange({variants: updatedVariants, images: addUniqueImages(images, variantImages)});
                    }}
                />
            </div>

            <div className="lg:sticky lg:top-5 lg:self-start flex flex-col gap-4">
                <ProductImagesCard
                    product={product}
                    isEdit={isEdit}
                    onLibraryImagesAdd={(libraryImages) => {
                        const newImages: ProductImage[] = libraryImages
                            .filter((img): img is typeof img & { id: number } => img.id != null)
                            .map(img => ({
                                uid: uuidv4(),
                                image_id: img.id,
                                image: {
                                    uid: uuidv4(),
                                    id: img.id,
                                    name: img.name,
                                    url: img.url,
                                    alt: img.alt ?? null,
                                },
                            }));
                        const merged = addUniqueImages(images, newImages);

                        if (merged !== images) {
                            onChange({images: merged});
                        }
                    }}
                    onLibraryImageRemove={(uid) => {
                        onChange({images: images.filter(i => i.uid !== uid)});
                    }}
                    onReorder={(reorderedImages) => {
                        onChange({images: reorderedImages});
                    }}
                />

                <ProductSummaryCard
                    title={product.title}
                    categoryName={product.category?.name ?? null}
                    imagesCount={images.length}
                    variants={variants}
                />
            </div>
        </div>
    );
}
