/**
 * Product Query Hooks
 *
 * React Query hooks for fetching product data
 */

import { useQuery } from '@tanstack/react-query';

import { getProduct, getProducts } from '@/lib/api/endpoints/products';
import type { ApiError } from '@/lib/api/fetch-client';
import { productKeys } from '@/lib/api/query-keys';
import type { Product, ProductFilters } from '@/types/api';

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';


// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all products
 * @param filters - Optional filters for searching and pagination
 * @param options - React Query options
 */
export function useProducts(
  filters?: ProductFilters,
  options?: Omit<UseQueryOptions<Product[], ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<Product[], ApiError> {
  return useQuery({
    queryKey: productKeys.list(filters as Record<string, unknown>),
    queryFn: async () => getProducts(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single product
 * @param id - Product ID
 * @param options - React Query options
 */
export function useProduct(
  id: number,
  options?: Omit<UseQueryOptions<Product, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<Product, ApiError> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => getProduct(id),
    enabled: !!id, // Don't run query if id is not provided
    ...options,
  });
}