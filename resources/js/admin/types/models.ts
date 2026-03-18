/**
 * Domain Model Types
 *
 * Generated from Laravel Eloquent models (app/Models/)
 * These represent the database entities and their relationships.
 */

// ============================================
// ENUMS & UNION TYPES
// ============================================

export type UserRole = 'admin' | 'manager';

export type ContactType = 'email' | 'phone' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';

export type DeliveryStatus = 'pending' | 'packing' | 'shipped' | 'transit' | 'delivered';

export type FinancialStatus = 'unpaid' | 'paid' | 'partial_paid' | 'refunded';

export type BrandRequestStatus = 'pending' | 'approved' | 'rejected';

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// ============================================
// USER
// ============================================

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Relations
  brands?: Brand[];
}

// ============================================
// BRAND
// ============================================

export interface Brand {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
  products?: Product[];
  categories?: Category[];
  orders?: Order[];
  images?: Image[];
  addresses?: Address[];
  contacts?: Contact[];
  shipping_methods?: ShippingMethod[];
}

// ============================================
// BRAND REQUEST
// ============================================

export interface BrandRequest {
  id: number;
  email: string;
  phone: string;
  name: string;
  brand_name: string;
  status: BrandRequestStatus;
  brand_id: number | null;
  user_id: number | null;
  rejection_reason: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  brand?: Brand;
  user?: User;
  reviewer?: User;
}

// ============================================
// CATEGORY
// ============================================

export interface Category {
  id: number;
  handle: string;
  name: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  options?: Option[];
  collections?: Collection[];
  brands?: Brand[];
  products?: Product[];
}

// ============================================
// COLLECTION
// ============================================

export interface Collection {
  id: number;
  handle: string;
  name: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: Category[];
}

// ============================================
// PRODUCT
// ============================================

export interface Product {
  id: number;
  brand_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  // Accessors
  external_url?: string;
  main_image?: Image;
  image_url?: string | null;
  min_price?: string;
  max_price?: string;
  // Relations
  brand?: Brand;
  category?: Category;
  options?: Option[];
  variants?: Variant[];
  images?: ProductImage[];
  order_items?: OrderItem[];
  statistics?: ProductStatistics[];
}

// ============================================
// PRODUCT IMAGE (pivot)
// ============================================

export interface ProductImage {
  id: number;
  product_id: number;
  image_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  // Accessor (loaded via image relation)
  url?: string | null;
  // Relations
  product?: Product;
  image?: Image;
  variants?: Variant[];
}

// ============================================
// IMAGE
// ============================================

export interface Image {
  id: number;
  name: string;
  src: string;
  alt: string | null;
  meta: string | null;
  created_at: string;
  updated_at: string;
  // Accessors
  url: string;
  // Relations
  products?: Product[];
  brands?: Brand[];
  // Pivot data (when loaded through product)
  pivot?: {
    position: number;
  };
}

// ============================================
// VARIANT
// ============================================

export interface Variant {
  id: number;
  product_id: number;
  image_id: number | null;
  title: string;
  price: string;
  final_price: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  // Accessors
  discount?: number;
  image_url?: string | null;
  // Relations
  product?: Product;
  image?: ProductImage;
  variant_values?: VariantValue[];
  values?: VariantValue[];
  order_items?: OrderItem[];
}

// ============================================
// OPTION
// ============================================

export interface Option {
  id: number;
  name: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  values?: OptionValue[];
  categories?: Category[];
  variant_values?: VariantValue[];
}

// ============================================
// OPTION VALUE
// ============================================

export interface OptionValue {
  id: number;
  option_id: number;
  value: string;
  position: number;
  created_at: string;
  updated_at: string;
  // Relations
  option?: Option;
  variant_values?: VariantValue[];
}

// ============================================
// VARIANT VALUE
// ============================================

export interface VariantValue {
  id: number;
  variant_id: number;
  option_id: number;
  option_value_id: number;
  created_at: string;
  updated_at: string;
  // Relations
  variant?: Variant;
  option?: Option;
  value?: OptionValue;
}

// ============================================
// ORDER
// ============================================

export interface Order {
  id: number;
  name: string;
  customer_id: number;
  brand_id: number;
  note: string | null;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  financial_status: FinancialStatus;
  created_at: string;
  updated_at: string;
  // Accessors
  status_url?: string;
  // Relations
  customer?: Customer;
  brand?: Brand;
  order_shippings?: OrderShipping[];
  order_items?: OrderItem[];
  audits?: Audit[];
}

// ============================================
// ORDER ITEM
// ============================================

export interface OrderItem {
  id: number;
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
  created_at: string;
  updated_at: string;
  // Accessors
  image_url?: string | null;
  // Relations
  order?: Order;
  product?: Product;
  variant?: Variant;
  image?: ProductImage;
}

// ============================================
// ORDER SHIPPING
// ============================================

export interface OrderShipping {
  id: number;
  order_id: number;
  name: string;
  phone: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  order?: Order;
}

// ============================================
// CUSTOMER
// ============================================

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  // Relations
  orders?: Order[];
}

// ============================================
// ADDRESS (polymorphic)
// ============================================

export interface Address {
  id: number;
  name: string | null;
  country: string;
  province: string | null;
  city: string;
  zip_code: string | null;
  address1: string | null;
  address2: string | null;
  addressable_type: string;
  addressable_id: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONTACT (polymorphic)
// ============================================

export interface Contact {
  id: number;
  type: ContactType;
  value: string;
  contactable_type: string;
  contactable_id: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// SHIPPING METHOD
// ============================================

export interface ShippingMethod {
  id: number;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  brands?: Brand[];
}

// ============================================
// AUDIT
// ============================================

export interface Audit {
  id: number;
  event: string;
  message: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  auditable_type: string;
  auditable_id: number;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

// ============================================
// PRODUCT STATISTICS
// ============================================

export interface ProductStatistics {
  id: number;
  product_id: number;
  client_id: string;
  type: string;
  geo: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SETTINGS
// ============================================

export interface Settings {
  id: number;
  key: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================
// PERMISSION
// ============================================

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}
