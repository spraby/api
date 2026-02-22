import {ProductForm} from "@/components/product-form";
import type {Product} from "@/types/models";

import AdminLayout from '../layouts/AdminLayout';

export default function ProductEdit({product}: { product: Product }) {
    const pageTitle = product.id ? 'Редактирование' : 'Новый продукт';

    return (
        <AdminLayout title={pageTitle}>
            <div className="p-3 sm:p-4 lg:p-6">
                <ProductForm product={product}/>
            </div>
        </AdminLayout>
    );
}
