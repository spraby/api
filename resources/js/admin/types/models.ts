// Base types
export interface BaseModel {
    id?: number;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// User & Auth
// ============================================================================

export interface User extends BaseModel {
    first_name: string | null;
    last_name: string | null;
    email: string;
    email_verified_at?: string | null;
    brands?: Brand[];
    roles?: Role[];
    // Computed accessors
    name?: string; // accessor: returns first_name
}

export interface Role extends BaseModel {
    name: string;
    guard_name: string;
    permissions?: Permission[];
}

export interface Permission extends BaseModel {
    name: string;
    guard_name: string;
}

// ============================================================================
// Brand
// ============================================================================

export interface Brand extends BaseModel {
    user_id: number | null;
    name: string;
    description?: string | null;
    // Relations
    user?: User | null;
    categories?: Category[];
    products?: Product[];
    settings?: BrandSettings[];
    orders?: Order[];
    images?: Image[];
}

export type BrandSettingsType = 'refund' | 'addresses' | 'delivery' | 'phones' | 'emails' | 'socials';

export interface BrandSettings extends BaseModel {
    brand_id: number;
    type: BrandSettingsType;
    data: any;
    brand?: Brand;
}

// ============================================================================
// Product & Variants
// ============================================================================

export interface Product extends BaseModel {
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    enabled: boolean;
    price: string; // decimal:2 -> string
    final_price: string; // decimal:2 -> string
    // Relations
    brand?: Brand;
    category?: Category | null;
    variants?: Variant[];
    images?: ProductImage[];
    orderItems?: OrderItem[];
    // Computed accessors
    externalUrl?: string; // computed: store URL + product ID
    mainImage?: ProductImage | null; // computed: first image by position
    discount?: number; // computed: percentage discount
}

export interface Variant extends BaseModel {
    product_id: number;
    image_id: number | null;
    title: string | null;
    price: string; // decimal:2 -> string
    final_price: string; // decimal:2 -> string
    enabled: boolean;
    // Relations
    product?: Product;
    image?: ProductImage | null;
    values?: VariantValue[];
    orderItems?: OrderItem[];
    // Computed accessors
    discount?: number; // computed: percentage discount
}

export interface VariantValue extends BaseModel {
    variant_id?: number;
    option_id: number;
    option_value_id: number;
    variant?: Variant;
    option?: Option;
    value?: OptionValue;
}

// ============================================================================
// Category & Options
// ============================================================================

export interface Category extends BaseModel {
    handle: string;
    name: string;
    title: string;
    header: string;
    description: string | null;
    // Relations
    options?: Option[];
    collections?: Collection[];
    brands?: Brand[];
    products?: Product[];
}

export interface Collection extends BaseModel {
    handle: string;
    name: string;
    title: string;
    header: string;
    description?: string | null;
    // Relations
    categories?: Category[];
}

export interface Option extends BaseModel {
    name: string;
    title: string;
    description: string | null;
    // Relations
    values?: OptionValue[];
    categories?: Category[];
    variantValues?: VariantValue[];
}

export interface OptionValue extends BaseModel {
    option_id: number;
    value: string;
    // Relations
    option?: Option;
    variantValues?: VariantValue[];
}

// ============================================================================
// Images
// ============================================================================

export interface Image extends BaseModel {
    name: string;
    src: string;
    alt?: string | null;
    meta?: string | null;
    // Computed accessors
    url: string; // S3 URL (always present)
    // Relations
    products?: Product[]; // via product_images pivot
    brands?: Brand[];
}

export interface ProductImage extends BaseModel {
    product_id: number;
    image_id: number;
    position: number;
    // Relations
    image?: Image;
    variants?: Variant[];
    orderItems?: OrderItem[];
}

// ============================================================================
// Orders
// ============================================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';
export type DeliveryStatus = 'pending' | 'packing' | 'shipped' | 'transit' | 'delivered';
export type FinancialStatus = 'unpaid' | 'paid' | 'partial_paid' | 'refunded';

export interface Order extends BaseModel {
    name: string;
    customer_id: number;
    brand_id: number;
    note?: string | null;
    status: OrderStatus;
    delivery_status: DeliveryStatus;
    financial_status: FinancialStatus;
    // Relations
    brand?: Brand;
    customer?: Customer;
    orderShippings?: OrderShipping[];
    orderItems?: OrderItem[];
    // Computed accessors
    status_url?: string; // computed: store URL + order name
}

export interface OrderItem extends BaseModel {
    order_id: number;
    product_id: number | null;
    variant_id: number | null;
    image_id: number | null;
    title: string;
    variant_title: string;
    description?: string | null;
    quantity: number;
    price: string; // decimal:2 -> string
    final_price: string; // decimal:2 -> string
    // Relations
    order?: Order;
    product?: Product | null;
    variant?: Variant | null;
    image?: ProductImage | null;
}

export interface OrderShipping extends BaseModel {
    order_id: number;
    name: string;
    phone: string;
    note: string;
    // Relations
    order?: Order;
}

// ============================================================================
// Customer
// ============================================================================

export interface Customer extends BaseModel {
    email: string;
    name: string;
    phone: string;
    // Relations
    orders?: Order[];
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
