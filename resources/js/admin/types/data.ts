/**
 * API Resource Types
 *
 * Generated from Laravel API Resources (app/Http/Resources/)
 * These represent the shape of data returned by the backend.
 */

// ============================================
// USER
// ============================================

export interface User {
    uid: string;
    id: number | null;
    first_name: string;
    last_name: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    created_at: string | null;
    updated_at: string | null;
    brands?: Brand[];
}

// ============================================
// BRAND
// ============================================

export interface Brand {
    uid: string;
    id: number | null;
    user_id: number;
    name: string;
    description: string | null;
    created_at: string | null;
    updated_at: string | null;
    user?: User;
    categories?: Category[];
    products?: Product[];
    orders?: Order[];
    images?: Image[];
    addresses?: Address[];
    contacts?: Contact[];
    shipping_methods?: ShippingMethod[];
}

// ============================================
// PRODUCT
// ============================================

export interface Product {
    uid: string;
    id: number | null;
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string;
    enabled: boolean;
    image_url: string | null;
    external_url: string;
    min_price: number | null;
    max_price: number | null;
    created_at: string | null;
    updated_at: string | null;
    brand?: Brand;
    category?: Category;
    images?: ProductImage[];
    variants?: Variant[];
}

// ============================================
// VARIANT
// ============================================

export interface Variant {
    uid: string;
    id?: number | null;
    product_id?: number | null;
    image_id?: number | null;
    title: string;
    price?: number;
    final_price?: number;
    enabled?: boolean;
    discount?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    image?: ProductImage;
    values?: VariantValue[];
}

// ============================================
// VARIANT VALUE
// ============================================

export interface VariantValue {
    uid: string;
    id?: number | null;
    variant_id?: number;
    option_id?: number;
    option_value_id?: number;
    created_at?: string | null;
    updated_at?: string | null;
    option?: Option;
    value?: OptionValue;
}

// ============================================
// CATEGORY
// ============================================

export interface Category {
    uid: string;
    id: number | null;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    options?: Option[];
    collections?: Collection[];
    brands?: Brand[];
    products?: Product[];
}

// ============================================
// COLLECTION
// ============================================

export interface Collection {
    uid: string;
    id: number | null;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    categories?: Category[];
}

// ============================================
// OPTION
// ============================================

export interface Option {
    uid: string;
    id: number | null;
    name: string;
    title: string;
    description: string | null;
    created_at: string | null;
    updated_at: string | null;
    values?: OptionValue[];
}

// ============================================
// OPTION VALUE
// ============================================

export interface OptionValue {
    uid: string;
    id?: number | null;
    option_id?: number;
    value: string;
    position: number;
    created_at?: string | null;
    updated_at?: string | null;
}

// ============================================
// IMAGE
// ============================================

export interface Image {
    uid: string;
    id?: number | null;
    name: string;
    src?: string;
    alt?: string | null;
    meta?: string | null;
    url: string;
    created_at?: string | null;
    updated_at?: string | null;
}

// ============================================
// PRODUCT IMAGE
// ============================================

export interface ProductImage {
    uid: string;
    id?: number | null;
    product_id?: number;
    image_id: number;
    position?: number;
    created_at?: string | null;
    updated_at?: string | null;
    image?: Image;
}

// ============================================
// ORDER
// ============================================

export interface Order {
    uid: string;
    id: number | null;
    name: string;
    status: string;
    delivery_status: string;
    financial_status: string;
    status_url: string;
    created_at: string | null;
    updated_at: string | null;
    customer?: Customer;
    brand?: Brand;
    order_items?: OrderItem[];
    order_shippings?: OrderShipping[];
}

// ============================================
// ORDER ITEM
// ============================================

export interface OrderItem {
    uid: string;
    id: number | null;
    order_id: number;
    product_id: number;
    variant_id: number;
    image_id: number | null;
    title: string;
    variant_title: string;
    description: string | null;
    quantity: number;
    price: string;
    final_price: string;
    created_at: string | null;
    updated_at: string | null;
    product?: Product;
    variant?: Variant;
    image?: ProductImage;
}

// ============================================
// ORDER SHIPPING
// ============================================

export interface OrderShipping {
    uid: string;
    id: number | null;
    order_id: number;
    name: string;
    phone: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
}

// ============================================
// CUSTOMER
// ============================================

export interface Customer {
    uid: string;
    id: number | null;
    email: string;
    name: string;
    phone: string;
    created_at: string | null;
    updated_at: string | null;
    orders?: Order[];
}

// ============================================
// ADDRESS
// ============================================

export interface Address {
    uid: string;
    id: number | null;
    name: string | null;
    country: string;
    province: string | null;
    city: string;
    zip_code: string | null;
    address1: string | null;
    address2: string | null;
    created_at: string | null;
    updated_at: string | null;
}

// ============================================
// CONTACT
// ============================================

export interface Contact {
    uid: string;
    id: number | null;
    type: string;
    value: string;
    created_at: string | null;
    updated_at: string | null;
}

// ============================================
// SHIPPING METHOD
// ============================================

export interface ShippingMethod {
    uid: string;
    id: number | null;
    key: string;
    name: string;
    description: string | null;
    created_at: string | null;
    updated_at: string | null;
}
