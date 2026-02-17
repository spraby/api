import {useCallback, useState} from 'react';

import {useForm} from '@inertiajs/react';

import type {ImageSelectorItem} from '@/components/image-selector';
import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductCategoryCard} from '@/components/product-category-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {useSaveBar} from '@/stores/save-bar';
import type {Product} from '@/types/models';

interface Props {
    product: Product;
}

export function ProductForm({product}: Props) {
    const isEdit = !!product.id;

    const [stagedItems, setStagedItems] = useState<ImageSelectorItem[]>([]);

    const {data, setData, put, post, transform, processing, errors, isDirty, reset} = useForm({
        title: product.title ?? '',
        description: product.description ?? '',
        enabled: product.enabled ?? false,
        category_id: product.category_id,
        variants: (product.variants ?? []).map(v => ({
            id: v.id,
            title: v.title ?? '',
            price: v.price ?? 0,
            final_price: v.final_price ?? 0,
            enabled: v.enabled ?? false,
            image_id: v.image_id ?? null,
            values: (v.values ?? []).map(val => ({
                option_id: val.option_id,
                option_value_id: val.option_value_id,
            })),
        })),
    });

    const onSave = useCallback(async () => {
        return new Promise<boolean>((resolve) => {
            const options = {
                preserveScroll: true,
                onSuccess: () => resolve(true),
                onError: () => resolve(false),
            };

            if (isEdit) {
                put(route('admin.products.update', {product: product.id}), options);
            } else {
                if (stagedItems.length > 0) {
                    transform(d => ({
                        ...d,
                        existing_image_ids: stagedItems.map(item => Number(item.uid)),
                        image_order: stagedItems.map((_, i) => `existing:${i}`),
                    }));
                }
                post(route('admin.products.store'), options);
            }
        });
    }, [isEdit, product.id, put, post, transform, stagedItems]);

    const onDiscard = useCallback(() => {
        reset();
        setStagedItems([]);
    }, [reset]);

    useSaveBar({hasChanges: isDirty || (!isEdit && stagedItems.length > 0), isSaving: processing, onSave, onDiscard});

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
                <ProductBasicFieldsCard
                    title={data.title}
                    description={data.description ?? ''}
                    errors={errors}
                    onChange={(field, value) => setData(field, value)}
                />
                <ProductImagesCard
                    product={product}
                    isEdit={isEdit}
                    stagedItems={stagedItems}
                    onStagedItemsChange={setStagedItems}
                />
            </div>

            <div className="flex flex-col gap-4">
                <ProductCategoryCard
                    categoryId={data.category_id ?? undefined}
                    categories={(product.brand?.categories ?? []).filter(cat => cat.id != null) as {id: number; name: string}[]}
                    error={errors.category_id}
                    onChange={val => setData('category_id', val)}
                />
            </div>
        </div>
    );
}
