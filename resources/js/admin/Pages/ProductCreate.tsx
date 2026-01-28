import {router} from '@inertiajs/react';
import {ArrowLeftIcon} from 'lucide-react';

import {ProductForm} from "@/components/product-form.tsx";
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import type {Product} from "@/types/models.ts";

import AdminLayout from '../layouts/AdminLayout';

export default function ProductCreate({product}: { product: Product }) {
    const {t} = useLang();

    return (
        <AdminLayout title={t('admin.products_edit.title')}>
            <div className="flex items-center flex-col gap-5">
                <div
                    className="max-w-[1200px] min-w-[1200px] @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
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
                    <ProductForm product={product}/>
                </div>
            </div>
        </AdminLayout>
    );
}
