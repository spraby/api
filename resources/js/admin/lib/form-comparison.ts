import type {FormVariant} from "@/components/product-form.tsx";
import type {ProductFormData} from "@/hooks/use-product-form.ts";

/**
 * Compare two variant value arrays for equality.
 * Ignores `variant_id` (may differ between saved and unsaved).
 */
function variantValuesEqual(
    a: FormVariant['values'],
    b: FormVariant['values'],
): boolean {
    if (!a && !b) {return true;}
    if (!a || !b) {return false;}
    if (a.length !== b.length) {return false;}

    for (let i = 0; i < a.length; i++) {
        const ai = a[i];
        const bi = b[i];

        if (!ai || !bi) {return false;}
        if (ai.option_id !== bi.option_id) {return false;}
        if (ai.option_value_id !== bi.option_value_id) {return false;}
    }

    return true;
}

/**
 * Compare two FormVariant arrays for meaningful changes.
 * Ignores `uid` (client-side metadata) and `product_id` (doesn't change).
 */
function variantsEqual(a: FormVariant[], b: FormVariant[]): boolean {
    if (a.length !== b.length) {return false;}

    for (let i = 0; i < a.length; i++) {
        const va = a[i];
        const vb = b[i];

        if (!va || !vb) {return false;}
        if (va.id !== vb.id) {return false;}
        if (va.image_id !== vb.image_id) {return false;}
        if (va.title !== vb.title) {return false;}
        if (va.price !== vb.price) {return false;}
        if (va.final_price !== vb.final_price) {return false;}
        if (va.enabled !== vb.enabled) {return false;}
        if (!variantValuesEqual(va.values, vb.values)) {return false;}
    }

    return true;
}

/**
 * Check if form data has changed compared to saved state.
 * Compares only meaningful, editable fields using direct equality.
 * Replaces lodash-es/isEqual — faster, skips irrelevant fields (uid, product_id).
 */
export function hasFormChanged(saved: ProductFormData, current: ProductFormData): boolean {
    if (saved.title !== current.title) {return true;}
    if (saved.description !== current.description) {return true;}
    if (saved.enabled !== current.enabled) {return true;}
    if (saved.category_id !== current.category_id) {return true;}

    return !variantsEqual(saved.variants ?? [], current.variants ?? []);
}
