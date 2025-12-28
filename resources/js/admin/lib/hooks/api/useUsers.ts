/**
 * User Query Hooks
 *
 * React Query hooks for fetching user data
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { getUser, getUsers } from '@/lib/api/endpoints/users';
import { userKeys } from '@/lib/api/query-keys';
import type { User, UserFilters } from '@/types/api';

import type { ApiError } from '@/lib/api/client';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all users
 * @param filters - Optional filters for searching and pagination
 * @param options - React Query options
 */
export function useUsers(
  filters?: UserFilters,
  options?: Omit<UseQueryOptions<User[], ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<User[], ApiError> {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single user
 * @param id - User ID
 * @param options - React Query options
 */
export function useUser(
  id: number,
  options?: Omit<UseQueryOptions<User, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<User, ApiError> {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id, // Don't run query if id is not provided
    ...options,
  });
}
