import {router} from '@inertiajs/react';
import {ExternalLinkIcon} from 'lucide-react';

import {ProductPageHeader} from "@/components/product-page-header.tsx";
import {ProductForm} from "@/components/product-form.tsx";
import {useLang} from '@/lib/lang';
import type {Product} from "@/types/models.ts";

import AdminLayout from '../layouts/AdminLayout';

interface ProductEditProps {
    product: Product;
    errors: string[]
}

export default function ProductEdit({product}: ProductEditProps) {
    const {t} = useLang();

    return (
        <AdminLayout title={t('admin.products_edit.title')}>
            <div className="flex items-center flex-col gap-5">
                <div
                    className="max-w-[1200px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <ProductPageHeader
                        title={t('admin.products_edit.title')}
                        description={t('admin.products_edit.description')}
                        onBack={() => {
                            router.visit('/admin/products');
                        }}
                        meta={product.externalUrl ? (
                            <a
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground underline hover:text-foreground"
                                href={product.externalUrl}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                View on store
                                <ExternalLinkIcon className="size-3"/>
                            </a>
                        ) : null}
                    />
                    <ProductForm product={product}/>
                </div>
            </div>
        </AdminLayout>
    );
}
