import {useCallback, useEffect, useMemo, useState} from 'react';
import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import type {Product, ProductImage, Variant} from '@/types/data';
import {v4 as uuidv4} from 'uuid';
import {CategoryVariantsGenerator} from "@/components/category-variants-generator.tsx";
import {VariantList} from "@/components/variant-list.tsx";
import {router} from '@inertiajs/react';
import {useSaveBar} from '@/stores/save-bar';
import {isEqual} from 'lodash-es';


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

    const onChange = useCallback((value: any) => {
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
                const idx = images.findIndex(pi => pi.image_id === v.image!.image_id);
                if (idx >= 0) imageIndex = idx;
            }

            return {
                ...(isEdit && v.id ? {id: v.id} : {}),
                title: v.title ?? '',
                price: Number(v.price) || 0,
                final_price: Number(v.final_price) || 0,
                enabled: v.enabled ?? true,
                image_index: imageIndex,
                values: (v.values ?? []).map(val => ({
                    option_id: val.option_id!,
                    option_value_id: val.option_value_id ?? val.value?.id,
                })).filter(val => val.option_id && val.option_value_id),
            };
        });

        const payload: Record<string, any> = {
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

    const handleSubmit = useCallback((): Promise<boolean> => {
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
                        onSetCategory={category => onChange({category})}
                        onGenerate={(combinations) => {
                            const newVariants: Variant[] = combinations.map(optionValues => ({
                                uid: uuidv4(),
                                title: optionValues.slice().sort((a, b) => a.position - b.position).map(v => v.value).join(' / '),
                                price: 0,
                                final_price: 0,
                                enabled: true,
                                values: optionValues.map(i => ({
                                    uid: uuidv4(),
                                    option_id: i.option_id,
                                    option_value_id: i.id ?? undefined,
                                    value: {
                                        uid: uuidv4(),
                                        id: i.id ?? undefined,
                                        value: i.value,
                                        position: i.position
                                    }
                                })),
                            }));
                            onChange({variants: newVariants})
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
                            .filter(img => img.id != null)
                            .map(img => ({
                                uid: uuidv4(),
                                image_id: img.id!,
                                image: {
                                    uid: uuidv4(),
                                    id: img.id!,
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
