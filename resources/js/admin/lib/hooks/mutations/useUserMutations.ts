/**
 * User Mutation Hooks
 *
 * React Query mutation hooks for user CRUD operations
 */

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  bulkDeleteUsers,
  bulkUpdateUserRoles,
  createUser,
  deleteUser,
  updateUser,
} from '@/lib/api/endpoints/users';
import type { ApiError } from '@/lib/api/fetch-client';
import { userKeys } from '@/lib/api/query-keys';
import type {
  BulkDeleteUsersRequest,
  BulkUpdateUserRolesRequest,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '@/types/api';


// ============================================
// CREATE USER
// ============================================

export function useCreateUser(
  options?: Omit<
    UseMutationOptions<User, ApiError, CreateUserRequest>,
    'mutationFn'
  >
): UseMutationResult<User, ApiError, CreateUserRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createUser,
    onSuccess: (data, variables, context) => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User created successfully');
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// UPDATE USER
// ============================================

interface UpdateUserVariables {
  id: number;
  data: UpdateUserRequest;
}

export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<User, ApiError, UpdateUserVariables>,
    'mutationFn'
  >
): UseMutationResult<User, ApiError, UpdateUserVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate both list and specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success('User updated successfully');
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// DELETE USER
// ============================================

export function useDeleteUser(
  options?: Omit<UseMutationOptions<void, ApiError, number>, 'mutationFn'>
): UseMutationResult<void, ApiError, number> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteUser,
    onSuccess: (data, variables, context) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(variables) });
      toast.success('User deleted successfully');
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// BULK DELETE USERS
// ============================================

export function useBulkDeleteUsers(
  options?: Omit<
    UseMutationOptions<void, ApiError, BulkDeleteUsersRequest>,
    'mutationFn'
  >
): UseMutationResult<void, ApiError, BulkDeleteUsersRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkDeleteUsers,
    onSuccess: (data, variables, context) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Remove deleted users from cache
      variables.user_ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      });
      toast.success(`Successfully deleted ${variables.user_ids.length} user(s)`);
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

// ============================================
// BULK UPDATE USER ROLES
// ============================================

export function useBulkUpdateUserRoles(
  options?: Omit<
    UseMutationOptions<void, ApiError, BulkUpdateUserRolesRequest>,
    'mutationFn'
  >
): UseMutationResult<void, ApiError, BulkUpdateUserRolesRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkUpdateUserRoles,
    onSuccess: (data, variables, context) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate updated users
      variables.user_ids.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      });
      toast.success(`Successfully updated ${variables.user_ids.length} user(s)`);
      // Call user's custom onSuccess if provided
      if (options?.onSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}
