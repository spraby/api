/**
 * Product API Endpoints
 *
 * All API functions for product management:
 * - CRUD operations
 * - Bulk operations
 * - Filtering and pagination
 */

import type {
  BulkDeleteProductsRequest,
  BulkUpdateProductStatusRequest,
  Product,
  ProductFilters,
  UpdateProductRequest,
} from '@/types/api';

import fetchClient from '../fetch-client';

// ============================================
// QUERY ENDPOINTS
// ============================================

/**
 * Get all products
 * @param filters - Optional filters for searching and pagination
 */
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const response = await fetchClient.get<Product[]>('/sb/admin/products/api', {
    params: filters as Record<string, string | number>,
  });

  return response.data;
}

/**
 * Get a single product by ID
 * @param id - Product ID
 */
export async function getProduct(id: number): Promise<Product> {
  const response = await fetchClient.get<Product>(`/sb/admin/products/${id}/api`);

  return response.data;
}

// ============================================
// MUTATION ENDPOINTS
// ============================================

/**
 * Update an existing product
 * @param id - Product ID
 * @param data - Product update data
 */
export async function updateProduct(
  id: number,
  data: UpdateProductRequest
): Promise<Product> {
  const response = await fetchClient.put<Product>(`/sb/admin/products/${id}/api`, data);

  return response.data;
}

/**
 * Delete a product
 * @param id - Product ID
 */
export async function deleteProduct(id: number): Promise<void> {
  await fetchClient.delete<void>(`/sb/admin/products/${id}/api`);
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk delete products
 * @param data - Object containing array of product IDs
 */
export async function bulkDeleteProducts(
  data: BulkDeleteProductsRequest
): Promise<void> {
  await fetchClient.post<void>('/sb/admin/products/bulk-delete/api', data);
}

/**
 * Bulk update product status (enabled/disabled)
 * @param data - Object containing array of product IDs and status
 */
export async function bulkUpdateProductStatus(
  data: BulkUpdateProductStatusRequest
): Promise<void> {
  await fetchClient.post<void>('/sb/admin/products/bulk-update-status/api', data);
}