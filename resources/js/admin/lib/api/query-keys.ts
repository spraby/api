/**
 * Query Keys Factory
 *
 * Centralized management of React Query cache keys.
 * Follows the hierarchical key structure recommended by TanStack Query.
 *
 * Pattern: [entity, scope, filters]
 * Example: ['users', 'list'] or ['users', 'detail', { id: 1 }]
 */

// ============================================
// USER QUERY KEYS
// ============================================

export const userKeys = {
  // All user-related queries
  all: ['users'] as const,

  // All user lists
  lists: () => [...userKeys.all, 'list'] as const,

  // Specific user list with filters
  list: (filters?: Record<string, unknown>) =>
    [...userKeys.lists(), filters] as const,

  // All user details
  details: () => [...userKeys.all, 'detail'] as const,

  // Specific user detail
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// ============================================
// PRODUCT QUERY KEYS (для будущего расширения)
// ============================================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

// ============================================
// CATEGORY QUERY KEYS (для будущего расширения)
// ============================================

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Invalidate all queries for a specific entity
 * Example: invalidateEntity(queryClient, 'users')
 */
export const getEntityKeys = (entity: 'users' | 'products' | 'categories') => {
  switch (entity) {
    case 'users':
      return userKeys.all;
    case 'products':
      return productKeys.all;
    case 'categories':
      return categoryKeys.all;
  }
};
