import {router} from '@inertiajs/react';

import {ProductPageHeader} from "@/components/product-page-header.tsx";
import {ProductForm} from "@/components/product-form.tsx";
import {useLang} from '@/lib/lang';
import type {Product} from "@/types/models.ts";

import AdminLayout from '../layouts/AdminLayout';

export default function ProductCreate({product}: { product: Product }) {
    const {t} = useLang();

    return (
        <AdminLayout title={t('admin.products_create.title')}>
            <div className="flex items-center flex-col gap-5">
                <div
                    className="max-w-[1200px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <ProductPageHeader
                        title={t('admin.products_create.title')}
                        description={t('admin.products_create.description')}
                        onBack={() => {
                            router.visit('/admin/products');
                        }}
                    />
                    <ProductForm product={product}/>
                </div>
            </div>
        </AdminLayout>
    );
}
