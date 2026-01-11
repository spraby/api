/**
 * API Types
 *
 * TypeScript types for API requests and responses
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  password?: string;
  password_confirmation?: string;
}

export interface BulkDeleteUsersRequest {
  user_ids: number[];
}

export interface BulkUpdateUserRolesRequest {
  user_ids: number[];
  role: string;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface OptionValue {
  id: number;
  option_id: number;
  value: string;
  position: number;
}

export interface Option {
  id: number;
  name: string;
  title: string;
  description?: string;
  values?: OptionValue[];
}

export interface Category {
  id: number;
  name: string;
  options?: Option[];
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface ProductImage {
  id: number;
  image_id: number;
  url: string | null;
  position: number;
}

export interface VariantValue {
  id?: number;
  variant_id?: number;
  option_id: number;
  option_value_id: number;
  option?: {
    id: number;
    name: string;
    title: string;
  };
  value?: {
    id: number;
    value: string;
  };
}

export interface Variant {
  id?: number;
  title: string | null;
  price: string;
  discount: string;
  final_price: string;
  enabled: boolean;
  image_id: number | null;
  image_url: string | null;
  values?: VariantValue[];
  _key?: string; // Temporary key for new variants (before they get an id)
}

export interface Product {
  id: number;
  title: string;
  description: string | null;
  price: string;
  final_price: string;
  enabled: boolean;
  brand_id: number;
  category_id: number | null;
  brand: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
    options?: Option[];
  } | null;
  image_url: string | null;
  images?: ProductImage[];
  variants?: Variant[];
  created_at: string;
}

export interface UpdateProductRequest {
  title: string;
  description: string | null;
  enabled: boolean;
  category_id: number | null;
  variants: Variant[];
}

export interface CreateProductRequest {
  title: string;
  description: string | null;
  price: string;
  final_price: string;
  enabled: boolean;
  category_id: number | null;
  variants: Variant[];
}

export interface BulkDeleteProductsRequest {
  product_ids: number[];
}

export interface BulkUpdateProductStatusRequest {
  product_ids: number[];
  enabled: boolean;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// ============================================
// FILTER TYPES
// ============================================

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  per_page?: number;
}

export interface ProductFilters {
  search?: string;
  brand_id?: number;
  category_id?: number;
  page?: number;
  per_page?: number;
}

// ============================================
// IMAGE MANAGEMENT TYPES
// ============================================

export interface Image {
  id: number;
  name: string;
  src: string;
  url: string;
  alt: string | null;
  brands: { id: number; name: string }[];
  created_at: string;
}

export interface AttachImagesRequest {
  image_ids: number[];
}

export interface ReorderImagesRequest {
  image_ids: number[];
}

export interface SetVariantImageRequest {
  product_image_id: number | null;
}

export interface MediaFilters {
  search?: string;
  page?: number;
  per_page?: number;
}
