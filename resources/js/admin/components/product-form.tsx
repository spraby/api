import {useState} from 'react';
import {ProductBasicFieldsCard} from '@/components/product-basic-fields-card';
import {ProductImagesCard} from '@/components/product-images-card';
import {ProductSummaryCard} from '@/components/product-summary-card';
import type {Product, Variant} from '@/types/data';
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
                        onSetCategory={category =>  onChange({category})}
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
                        onChange={(variants) => onChange({
                            variants,
                            images: [...(product?.images ?? []), variants.map(v => v.image)]
                        })}
                    />
                </div>

                <div
                    className="flex flex-col gap-4"
                    style={{position: 'sticky', top: '20px', alignSelf: 'start'}}
                >
                    <ProductImagesCard
                        product={product}
                        isEdit={isEdit}
                        onLibraryImagesAdd={() => {}}
                        onLibraryImageRemove={() => {}}
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
