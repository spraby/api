import {useState} from 'react';
import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import type {Product, ProductImage, Variant} from '@/types/data';
import {v4 as uuidv4} from 'uuid';
import {CategoryVariantsGenerator} from "@/components/category-variants-generator.tsx";
import {VariantList} from "@/components/variant-list.tsx";


export function ProductForm({product: defaultProduct}: {
    product: Product
}) {
    const isEdit = !!defaultProduct.id;
    const categories = defaultProduct.brand?.categories ?? [];

    const [product, setProduct] = useState<Product>(defaultProduct)
    const [errors, serErrors] = useState<any>([])


    const onChange = (value: any) => {
        setProduct(v => ({...v, ...value}));
    }


    return (
        <div className="flex flex-col gap-4">
            <div
                className="grid gap-4"
                style={{gridTemplateColumns: '1fr 340px'}}
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

                    <CategoryVariantsGenerator
                        categories={categories}
                        onSetCategory={category => onChange({category})}
                        onGenerate={(combinations) => {
                            const variants: Variant[] = combinations.map(optionValues => ({
                                uid: uuidv4(),
                                title: optionValues.slice().sort((a, b) => a.position - b.position).map(v => v.value).join(' / '),
                                price: 0,
                                final_price: 0,
                                values: optionValues.map(i => ({
                                    uid: uuidv4(),
                                    option_id: i.option_id,
                                    value: {
                                        uid: uuidv4(),
                                        value: i.value,
                                        position: i.position
                                    }
                                })),
                            }));
                            onChange({variants})
                        }}
                    />

                    <VariantList
                        variants={product?.variants ?? []}
                        images={product?.images ?? []}
                        onChange={(variants) => {
                            const existingImages = product?.images ?? [];
                            const existingImageIds = new Set(existingImages.map(i => i.image_id));
                            const newImages = variants.map(v => v.image)
                                .filter((img): img is ProductImage => !!img && !existingImageIds.has(img.image_id));
                            onChange({variants, images: [...existingImages, ...newImages]});
                        }}
                    />
                </div>

                <div
                    className="flex flex-col gap-4"
                    style={{position: 'sticky', top: '20px', alignSelf: 'start'}}
                >
                    <ProductImagesCard
                        product={product}
                        isEdit={isEdit}
                        onLibraryImagesAdd={(images) => {
                            const existingImageIds = new Set((product?.images ?? []).map(i => i.image_id));
                            const newImages: ProductImage[] = images
                                .filter(img => img.id != null && !existingImageIds.has(img.id))
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
                            if (newImages.length > 0) {
                                onChange({images: [...(product?.images ?? []), ...newImages]});
                            }
                        }}
                        onLibraryImageRemove={(uid) => {
                            onChange({images: (product?.images ?? []).filter(i => i.uid !== uid)});
                        }}
                        onReorder={(images) => {
                            onChange({images});
                        }}
                    />

                    <ProductSummaryCard
                        title={product.title}
                        categoryName={product.category?.name ?? null}
                        imagesCount={product.images?.length ?? 0}
                        variants={[]}
                    />
                </div>
            </div>
        </div>
    );
}
