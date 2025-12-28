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
// PRODUCT TYPES (для будущего расширения)
// ============================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  final_price?: string;
  brand_id: number;
  created_at: string;
  updated_at?: string;
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
