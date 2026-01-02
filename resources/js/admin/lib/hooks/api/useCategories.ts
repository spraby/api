/**
 * Category Query Hooks
 *
 * React Query hooks for fetching categories
 */

import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/lib/api/endpoints/categories';
import type { ApiError } from '@/lib/api/fetch-client';
import type { Category } from '@/types/api';

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all categories
 * @param brandId - Optional brand ID to filter categories
 */
export function useCategories(
  brandId?: number,
  options?: Omit<UseQueryOptions<Category[], ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<Category[], ApiError> {
  return useQuery({
    queryKey: ['categories', brandId],
    queryFn: async () => getCategories(brandId),
    ...options,
  });
}