import {ProductForm} from "@/components/product-form";
import type {Product} from "@/types/data";

import AdminLayout from '../layouts/AdminLayout';

export default function ProductEdit({product}: { product: Product }) {
    console.log('product =>', product);
    return (
        <AdminLayout title={'Новый продукт'}>
            <div className="p-3 sm:p-4 lg:p-6">
                <ProductForm product={product}/>
            </div>
        </AdminLayout>
    );
}
