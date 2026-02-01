/**
 * Category API Endpoints
 *
 * API functions for fetching categories
 */

import type { Category } from '@/types/api';

import fetchClient from '../fetch-client';

// ============================================
// QUERY ENDPOINTS
// ============================================

/**
 * Get all categories (for dropdowns)
 * @param brandId - Optional brand ID to filter categories
 */
export async function getCategories(brandId?: number): Promise<Category[]> {
  const params = brandId ? { brand_id: brandId } : {};
  const response = await fetchClient.get<{ data: Category[] }>('/admin/categories/api', {
    params,
  });

  return response.data.data;
}