// Base types
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// User
export interface User extends BaseModel {
  name: string;
  email: string;
  email_verified_at?: string;
  brand_id?: number;
  brands?: Brand[];
  roles?: Role[];
}

// Brand
export interface Brand extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  is_active: boolean;
  settings?: BrandSettings;
}

export interface BrandSettings extends BaseModel {
  brand_id: number;
  settings: Record<string, unknown>;
}

// Product
export interface Product extends BaseModel {
  brand_id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  barcode?: string;
  price: string;
  compare_price?: string;
  cost_price?: string;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  low_stock_threshold?: number;
  weight?: number;
  meta_title?: string;
  meta_description?: string;
  brand?: Brand;
  variants?: Variant[];
  images?: ProductImage[];
  categories?: Category[];
  collections?: Collection[];
  options?: Option[];
}

// Variant
export interface Variant extends BaseModel {
  product_id: number;
  sku: string;
  barcode?: string;
  price: string;
  compare_price?: string;
  cost_price?: string;
  stock_quantity: number;
  is_active: boolean;
  product?: Product;
  option_values?: OptionValue[];
}

// Category
export interface Category extends BaseModel {
  brand_id: number;
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  brand?: Brand;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

// Collection
export interface Collection extends BaseModel {
  brand_id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  brand?: Brand;
  products?: Product[];
}

// Option
export interface Option extends BaseModel {
  brand_id: number;
  name: string;
  display_name: string;
  type: 'select' | 'radio' | 'color' | 'button';
  sort_order: number;
  is_required: boolean;
  brand?: Brand;
  values?: OptionValue[];
}

export interface OptionValue extends BaseModel {
  option_id: number;
  value: string;
  display_value: string;
  color_code?: string;
  sort_order: number;
  option?: Option;
}

// Image
export interface Image extends BaseModel {
  name: string;
  src: string;
  alt?: string;
  meta?: string;
  url?: string; // Computed attribute from Laravel
  brands: Brand[]; // Always loaded with eager loading in MediaController
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_id: number;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  image?: Image;
}

// Order
export interface Order extends BaseModel {
  brand_id: number;
  customer_id?: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: string;
  tax: string;
  shipping_cost: string;
  discount: string;
  total: string;
  currency: string;
  notes?: string;
  brand?: Brand;
  customer?: Customer;
  items?: OrderItem[];
  shipping?: OrderShipping;
}

export interface OrderItem extends BaseModel {
  order_id: number;
  product_id: number;
  variant_id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  subtotal: string;
  order?: Order;
  product?: Product;
  variant?: Variant;
}

export interface OrderShipping extends BaseModel {
  order_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  tracking_number?: string;
  carrier?: string;
  order?: Order;
}

// Customer
export interface Customer extends BaseModel {
  brand_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  brand?: Brand;
  orders?: Order[];
}

// Role & Permission
export interface Role extends BaseModel {
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission extends BaseModel {
  name: string;
  guard_name: string;
}

// Pagination
export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}