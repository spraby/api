import { Link, router } from '@inertiajs/react';
import { AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react';

import {ProductForm} from "@/components/product-form";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/lang';
import type {Product} from "@/types/data";

import AdminLayout from '../layouts/AdminLayout';

export default function ProductCreate({product}: { product: Product }) {
    const { t } = useLang();
    // Товар создаётся только в категории бренда — без категорий форму не показываем.
    const hasCategories = (product?.brand?.categories ?? []).length > 0;

    return (
        <AdminLayout title={t('admin.products_create.title')}>
            <div className="flex items-center flex-col gap-5">
                <div className="w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    className="size-8"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                        router.visit('/admin/products');
                                    }}
                                >
                                    <ArrowLeftIcon className="size-4" />
                                </Button>
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {t('admin.products_create.title')}
                                </h1>
                            </div>
                            <p className="pl-10 text-sm text-muted-foreground">
                                {t('admin.products_create.description')}
                            </p>
                        </div>
                    </div>
                    {hasCategories ? (
                        <ProductForm product={product}/>
                    ) : (
                        <Alert variant="warning">
                            <AlertTriangleIcon className="size-4" />
                            <AlertTitle>{t('admin.products_create.no_categories.title')}</AlertTitle>
                            <AlertDescription>
                                <p>{t('admin.products_create.no_categories.description')}</p>
                                <Button asChild className="mt-2" size="sm">
                                    <Link href={route('admin.my-categories')}>
                                        {t('admin.products_create.no_categories.action')}
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
