/**
 * Product Mutation Hooks
 *
 * React Query mutation hooks for product CRUD operations
 */

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  deleteProduct,
  updateProduct,
} from '@/lib/api/endpoints/products';
import type { ApiError } from '@/lib/api/fetch-client';
import { productKeys } from '@/lib/api/query-keys';
import type {
  BulkDeleteProductsRequest,
  BulkUpdateProductStatusRequest,
  Product,
  UpdateProductRequest,
} from '@/types/api';

import type {
  UseMutationOptions,
  UseMutationResult} from '@tanstack/react-query';


// ============================================
// UPDATE PRODUCT
// ============================================

interface UpdateProductVariables {
  id: number;
  data: UpdateProductRequest;
}

export function useUpdateProduct(
  options?: Omit<
    UseMutationOptions<Product, ApiError, UpdateProductVariables>,
    'mutationFn'
  >
): UseMutationResult<Product, ApiError, UpdateProductVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async ({ id, data }) => updateProduct(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate both list and specific product detail
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// DELETE PRODUCT
// ============================================

export function useDeleteProduct(
  options?: Omit<UseMutationOptions<void, ApiError, number>, 'mutationFn'>
): UseMutationResult<void, ApiError, number> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteProduct,
    onSuccess: (data, variables, context) => {
      // Invalidate products list
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Remove the specific product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(variables) });
      toast.success('Product deleted successfully');
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// BULK DELETE PRODUCTS
// ============================================

export function useBulkDeleteProducts(
  options?: Omit<
    UseMutationOptions<void, ApiError, BulkDeleteProductsRequest>,
    'mutationFn'
  >
): UseMutationResult<void, ApiError, BulkDeleteProductsRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkDeleteProducts,
    onSuccess: (data, variables, context) => {
      // Invalidate products list
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Remove deleted products from cache
      variables.product_ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      });
      toast.success(`Successfully deleted ${variables.product_ids.length} product(s)`);
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// BULK UPDATE PRODUCT STATUS
// ============================================

export function useBulkUpdateProductStatus(
  options?: Omit<
    UseMutationOptions<void, ApiError, BulkUpdateProductStatusRequest>,
    'mutationFn'
  >
): UseMutationResult<void, ApiError, BulkUpdateProductStatusRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkUpdateProductStatus,
    onSuccess: (data, variables, context) => {
      // Invalidate products list
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate updated products
      variables.product_ids.forEach((id) => {
        void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      });
      const status = variables.enabled ? 'enabled' : 'disabled';

      toast.success(`Successfully ${status} ${variables.product_ids.length} product(s)`);
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}