import type {FormEventHandler} from 'react';
import {useEffect, useState} from 'react';

import {router} from '@inertiajs/react';
import {ArrowLeftIcon, PlusIcon} from 'lucide-react';
import {toast} from 'sonner';

import {ProductImagesManager} from '@/components/product-images-manager';
import {ProductImagesPicker} from '@/components/product-images-picker';
import {ProductVariantItem} from '@/components/product-variant-item';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
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
import {Skeleton} from '@/components/ui/skeleton';
import {useCategories} from '@/lib/hooks/api/useCategories';
import {useProduct} from '@/lib/hooks/api/useProducts';
import {useSetVariantImage} from '@/lib/hooks/mutations/useProductImageMutations';
import {useUpdateProduct} from '@/lib/hooks/mutations/useProductMutations';
import {useLang} from '@/lib/lang';
import type {Variant} from '@/types/api';

import AdminLayout from '../layouts/AdminLayout';

interface ProductEditProps {
    productId: number;
}

// Generate unique temporary key for new variants
const generateVariantKey = (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get stable key for variant
const getVariantKey = (variant: Variant, index: number): string => {
    if (variant.id) {
        return `variant-${variant.id}`;
    }
    if (variant._key) {
        return variant._key;
    }

    return `variant-index-${index}`;
};

export default function ProductEdit({productId}: ProductEditProps) {
    const {t} = useLang();

    // API Hooks
    const {data: product, isLoading, error} = useProduct(productId);
    const {data: categories = []} = useCategories(product?.brand_id, {
        enabled: !!product?.brand_id,
    });
    const updateProduct = useUpdateProduct();
    const setVariantImage = useSetVariantImage();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        final_price: '',
        enabled: true,
        category_id: null as number | null,
    });

    const [variants, setVariants] = useState<Variant[]>([
        {
            title: '',
            price: '',
            final_price: '',
            enabled: true,
            image_id: null,
            image_url: null,
            _key: generateVariantKey()
        },
    ]);
    const [variantImagePicker, setVariantImagePicker] = useState<{
        open: boolean;
        variantIndex: number | null;
    }>({open: false, variantIndex: null});

    // Update form when product data loads
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title,
                description: product.description ?? '',
                price: product.price,
                final_price: product.final_price,
                enabled: product.enabled,
                category_id: product.category_id,
            });

            // Set variants from product or default to one variant
            if (product.variants && product.variants.length > 0) {
                setVariants(product.variants);
            }
        }
    }, [product]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Ensure at least one variant
        if (variants.length === 0) {
            toast.error(t('admin.products_edit.errors.at_least_one_variant'));

            return;
        }

        updateProduct.mutate(
            {
                id: productId,
                data: {
                    ...formData,
                    variants,
                },
            },
            {
                onSuccess: () => {
                    toast.success(t('admin.products_edit.success.saved'));
                },
            }
        );
    };

    const addVariant = () => {
        setVariants([
            {
                title: '',
                price: formData.price,
                final_price: formData.final_price,
                enabled: true,
                image_id: null,
                image_url: null,
                _key: generateVariantKey(),
            },
            ...variants,
        ]);
    };

    const removeVariant = (index: number) => {
        if (variants.length === 1) {
            toast.error(t('admin.products_edit.errors.at_least_one_variant'));

            return;
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | boolean) => {
        const newVariants = [...variants];
        const currentVariant = newVariants[index];

        if (!currentVariant) {
            return;
        }

        newVariants[index] = {...currentVariant, [field]: value};
        setVariants(newVariants);
    };

    const updateVariantOptionValue = (variantIndex: number, optionId: number, optionValueId: number) => {
        const newVariants = [...variants];
        const variant = newVariants[variantIndex];

        if (!variant) {
            return;
        }

        // Initialize values array if it doesn't exist
        if (!variant.values) {
            variant.values = [];
        }

        // Find existing value for this option
        const existingValueIndex = variant.values.findIndex((v) => v.option_id === optionId);

        if (existingValueIndex >= 0) {
            // Update existing value
            variant.values[existingValueIndex] = {
                ...variant.values[existingValueIndex],
                option_id: optionId,
                option_value_id: optionValueId,
            };
        } else {
            // Add new value
            variant.values.push({
                option_id: optionId,
                option_value_id: optionValueId,
            });
        }

        setVariants(newVariants);
    };

    const handleVariantImageSelect = (productImageId: number) => {
        if (variantImagePicker.variantIndex === null) {
            return;
        }

        const variant = variants[variantImagePicker.variantIndex];

        if (!variant?.id) {
            toast.error(t('admin.products_edit.errors.save_variant_first'));

            return;
        }

        const currentIndex = variantImagePicker.variantIndex;

        setVariantImage.mutate(
            {
                variantId: variant.id,
                productId,
                data: {product_image_id: productImageId},
            },
            {
                onSuccess: (data) => {
                    // Update local state instead of waiting for full product reload
                    const newVariants = [...variants];

                    newVariants[currentIndex] = data.variant;

                    setVariants(newVariants);
                },
            }
        );
    };

    const removeVariantImage = (index: number) => {
        const variant = variants[index];

        if (!variant?.id) {
            return;
        }

        setVariantImage.mutate(
            {
                variantId: variant.id,
                productId,
                data: {product_image_id: null},
            },
            {
                onSuccess: (data) => {
                    // Update local state instead of waiting for full product reload
                    const newVariants = [...variants];

                    newVariants[index] = data.variant;

                    setVariants(newVariants);
                },
            }
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <AdminLayout title={t('admin.products_edit.title')}>
                <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-48"/>
                            <Skeleton className="h-4 w-64"/>
                        </div>
                    </div>
                    <Skeleton className="h-96 w-full"/>
                </div>
            </AdminLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AdminLayout title={t('admin.products_edit.title')}>
                <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <Alert variant="destructive">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={() => {
                        router.visit('/sb/admin/products');
                    }}>
                        <ArrowLeftIcon className="mr-2 size-4"/>
                        {t('admin.products_edit.actions.back')}
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={t('admin.products_edit.title')}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                className="size-8"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    router.visit('/sb/admin/products');
                                }}
                            >
                                <ArrowLeftIcon className="size-4"/>
                            </Button>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {t('admin.products_edit.title')}
                            </h1>
                        </div>
                        <p className="pl-10 text-sm text-muted-foreground">
                            {t('admin.products_edit.description')}
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Product Information */}
                    <div className="rounded-lg border bg-card p-4 sm:p-6">
                        <h2 className="mb-4 text-lg font-semibold">{t('admin.products_edit.sections.product_info')}</h2>


                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-5 flex flex-col gap-5">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="flex items-center gap-1" htmlFor="title">
                                        {t('admin.products_edit.fields.title')}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        required
                                        disabled={updateProduct.isPending}
                                        id="title"
                                        placeholder={t('admin.products_edit.placeholders.title')}
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => {
                                            setFormData({...formData, title: e.target.value});
                                        }}
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                                    <RichTextEditor
                                        disabled={updateProduct.isPending}
                                        placeholder={t('admin.products_edit.placeholders.description')}
                                        value={formData.description}
                                        onChange={(value) => {
                                            setFormData({...formData, description: value});
                                        }}
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                                    <Select
                                        disabled={updateProduct.isPending}
                                        value={formData.category_id?.toString() ?? 'none'}
                                        onValueChange={(value) => {
                                            // Ignore empty string values (happens when Select can't find the option)
                                            if (value === '') {
                                                return;
                                            }
                                            setFormData({
                                                ...formData,
                                                category_id: value === 'none' ? null : Number(value)
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="none">{t('admin.products_edit.category.none')}</SelectItem>
                                            {/* Show product's category even if it's not in the brand's categories list */}
                                            {product?.category && !categories.find(c => c.id === product.category_id) ? (
                                                <SelectItem key={product.category.id}
                                                            value={product.category.id.toString()}>
                                                    {product.category.name}
                                                </SelectItem>
                                            ) : null}
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <Checkbox
                                        checked={formData.enabled}
                                        disabled={updateProduct.isPending}
                                        id="enabled"
                                        onCheckedChange={(checked) => {
                                            setFormData({...formData, enabled: checked as boolean});
                                        }
                                        }
                                    />
                                    <Label className="cursor-pointer" htmlFor="enabled">
                                        {t('admin.products_edit.fields.enabled')}
                                    </Label>
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="category">{t('admin.products_edit.sections.product_images')}</Label>
                                    {!!product && (
                                        <ProductImagesManager
                                            disabled={updateProduct.isPending}
                                            images={product.images || []}
                                            productId={productId}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="col-span-7 space-y-4">
                                <div className="flex items-center justify-end">
                                    <Button
                                        disabled={updateProduct.isPending}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={addVariant}
                                    >
                                        <PlusIcon className="size-4"/>
                                        {t('admin.products_edit.actions.add_variant')}
                                    </Button>
                                </div>

                                {variants.map((variant, index) => (
                                    <ProductVariantItem
                                        key={getVariantKey(variant, index)}
                                        disabled={updateProduct.isPending}
                                        index={index}
                                        productCategoryOptions={product?.category?.options}
                                        variant={variant}
                                        variantsLength={variants.length}
                                        onImageRemove={() => {
                                            removeVariantImage(index);
                                        }}
                                        onImageSelect={() => {
                                            setVariantImagePicker({open: true, variantIndex: index});
                                        }}
                                        onOptionValueChange={(optionId, optionValueId) => {
                                            updateVariantOptionValue(index, optionId, optionValueId);
                                        }}
                                        onRemove={() => {
                                            removeVariant(index);
                                        }}
                                        onUpdate={(field, value) => {
                                            updateVariant(index, field, value);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>


                    </div>


                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                disabled={updateProduct.isPending}
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    router.visit('/sb/admin/products');
                                }}
                            >
                                {t('admin.products_edit.actions.cancel')}
                            </Button>
                            <Button disabled={updateProduct.isPending} type="submit">
                                {updateProduct.isPending
                                    ? t('admin.products_edit.actions.saving')
                                    : t('admin.products_edit.actions.save')}
                            </Button>
                        </div>
                    </div>

                    {/* Variant Image Picker Dialog */}
                    {!!product && (
                        <ProductImagesPicker
                            currentImageId={
                                variantImagePicker.variantIndex !== null
                                    ? variants[variantImagePicker.variantIndex]?.image_id ?? null
                                    : null
                            }
                            open={variantImagePicker.open}
                            productImages={product.images || []}
                            onOpenChange={(open) => {
                                setVariantImagePicker({open, variantIndex: null});
                            }}
                            onSelect={handleVariantImageSelect}
                        />
                    )}
                </form>
            </div>
        </AdminLayout>
    )
        ;
}
