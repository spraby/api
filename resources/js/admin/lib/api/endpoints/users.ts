/**
 * User API Endpoints
 *
 * All API functions for user management:
 * - CRUD operations
 * - Bulk operations
 * - Filtering and pagination
 */

import type {
  BulkDeleteUsersRequest,
  BulkUpdateUserRolesRequest,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserFilters,
} from '@/types/api';

import fetchClient from '../fetch-client';

// ============================================
// QUERY ENDPOINTS
// ============================================

/**
 * Get all users
 * @param filters - Optional filters for searching and pagination
 */
export async function getUsers(filters?: UserFilters): Promise<User[]> {
  const response = await fetchClient.get<User[]>('/admin/users/api', {
    params: filters as Record<string, string | number>,
  });

  return response.data;
}

/**
 * Get a single user by ID
 * @param id - User ID
 */
export async function getUser(id: number): Promise<User> {
  const response = await fetchClient.get<User>(`/admin/users/${id}/api`);

  return response.data;
}

// ============================================
// MUTATION ENDPOINTS
// ============================================

/**
 * Create a new user
 * @param data - User creation data
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetchClient.post<User>('/admin/users/api', data);

  return response.data;
}

/**
 * Update an existing user
 * @param id - User ID
 * @param data - User update data
 */
export async function updateUser(
  id: number,
  data: UpdateUserRequest
): Promise<User> {
  const response = await fetchClient.put<User>(`/admin/users/${id}/api`, data);

  return response.data;
}

/**
 * Delete a user
 * @param id - User ID
 */
export async function deleteUser(id: number): Promise<void> {
  await fetchClient.delete<void>(`/admin/users/${id}/api`);
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk delete users
 * @param data - Object containing array of user IDs
 */
export async function bulkDeleteUsers(
  data: BulkDeleteUsersRequest
): Promise<void> {
  await fetchClient.post<void>('/admin/users/bulk-delete/api', data);
}

/**
 * Bulk update user roles
 * @param data - Object containing array of user IDs and new role
 */
export async function bulkUpdateUserRoles(
  data: BulkUpdateUserRolesRequest
): Promise<void> {
  await fetchClient.post<void>('/admin/users/bulk-update-role/api', data);
}
