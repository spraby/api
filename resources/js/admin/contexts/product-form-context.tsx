import {createContext, useContext} from 'react';

import type {useProductForm} from '@/hooks/use-product-form';

export type ProductFormContextValue = ReturnType<typeof useProductForm>;

export const ProductFormContext = createContext<ProductFormContextValue | null>(null);

export function useProductFormContext(): ProductFormContextValue {
    const ctx = useContext(ProductFormContext);

    if (!ctx) {
        throw new Error('useProductFormContext must be used within ProductForm');
    }

    return ctx;
}
