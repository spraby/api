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

export interface Category {
  id: number;
  name: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Variant {
  id?: number;
  title: string | null;
  price: string;
  final_price: string;
  enabled: boolean;
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
  } | null;
  image_url: string | null;
  variants?: Variant[];
  created_at: string;
}

export interface UpdateProductRequest {
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
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
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
