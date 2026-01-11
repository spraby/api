/**
 * Variant Option Selector Component
 *
 * Allows selecting option values for a product variant based on category options
 */
import {type FormEventHandler, useEffect, useMemo} from "react";

import {useForm, router} from '@inertiajs/react';

import {ProductImagesManager} from "@/components/product-images-manager.tsx";
import {ProductVariantList} from "@/components/product-variant-list.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
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
import {useLang} from '@/lib/lang';
import type {Product} from "@/types/models.ts";


export function ProductForm({product: defaultProduct}: { product: Product }) {
    const {t} = useLang();

    const {data: product, setData, errors, put, post, processing} = useForm(defaultProduct);
    const isEditMode = useMemo(() => !!product?.id, [product?.id]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [product?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) return null;
        if (product?.category_id) {
            return brandCategories.find(i => i.id === product.category_id);
        }
        return brandCategories[0]
    }, [product, brandCategories])

    useEffect(() => {
        if (!product?.category_id && !!category?.id) setData('category_id', category?.id);
    }, [product, category]);

    /**
     *
     * @param e
     */
    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (product?.id) {
            put(route('sb.admin.products.update', product.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props['product'] as Product);
                },
            });
        } else {
            post(route('sb.admin.products.store'));
        }
    }

    return <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            <div className="col-span-1 md:col-span-9">
                <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
                    <div className="col-span-12 gap-2 flex flex-col">
                        <Label className="flex items-center gap-1" htmlFor="title">
                            {t('admin.products_edit.fields.title')}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            required
                            id="title"
                            placeholder={t('admin.products_edit.placeholders.title')}
                            type="text"
                            value={product.title}
                            onChange={e => setData('title', e.target.value)}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>
                    <div className="col-span-12 gap-2 flex flex-col">
                        <Label
                            htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                        <RichTextEditor
                            placeholder={t('admin.products_edit.placeholders.description')}
                            value={product.description ?? ''}
                            onChange={v => setData('description', v)}
                        />
                        {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>
                </Card>
            </div>

            <div className="col-span-1 md:col-span-3">
                <Card className="flex flex-col gap-4 md:gap-5 rounded-lg border bg-card p-4 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={product.enabled}
                                id="enabled"
                                onCheckedChange={v => setData('enabled', v as boolean)}
                            />
                            <Label className="cursor-pointer" htmlFor="enabled">
                                {t('admin.products_edit.fields.enabled')}
                            </Label>
                        </div>
                        {!!errors.enabled && <p className="text-xs text-destructive">{errors.enabled}</p>}
                    </div>
                    {
                        !!category?.id ?
                            <div className="gap-2 flex flex-col">
                                <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                                <Select
                                    disabled={isEditMode}
                                    value={category.id.toString()}
                                    onValueChange={(value) => {
                                        if (!value?.length) {
                                            return;
                                        }
                                        setData('category_id', Number(value));
                                    }}
                                >
                                    <SelectTrigger
                                        id="category"
                                        className={errors.category_id ? 'border-destructive' : ''}
                                    >
                                        <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandCategories.map((category) => (
                                            category?.id ?
                                                <SelectItem key={category.id} value={category?.id.toString()}>
                                                    {category.name}
                                                </SelectItem> : null
                                        ))}
                                    </SelectContent>
                                </Select>


                                {!!errors.category_id &&
                                    <p className="text-xs text-destructive">{errors.category_id}</p>}
                                {!isEditMode && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.products_edit.category.locked')}
                                    </p>
                                )}

                            </div> :
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {t('admin.products_edit.category.not_in_list')}
                                </AlertDescription>
                            </Alert>
                    }
                </Card>
            </div>

            {
                !!product?.id &&
                <Card className="col-span-9 p-4 sm:p-6">
                    <ProductImagesManager
                        disabled={processing}
                        images={product.images || []}
                        productId={product?.id}
                    />
                </Card>
            }
            {
                (!!product?.variants?.length) && <ProductVariantList
                    product={product}
                    onUpdate={v => {
                        setData('variants', [...v])
                    }}
                    options={category?.options ?? []}

                    // productImages={product?.images ?? []}
                    // categoryOptions={product?.category?.options ?? []}
                    // variants={product.variants}
                    // disabled={processing}
                />
            }

        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    className="w-full sm:w-auto"
                    onClick={() => {
                        router.visit(route('sb.admin.products'));
                    }}
                >
                    {t('admin.products_edit.actions.cancel')}
                </Button>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing
                        ? t('admin.products_edit.actions.saving')
                        : t('admin.products_edit.actions.save')}
                </Button>
            </div>
        </div>


    </form>;
}
