import type { User } from '@/types/inertia'

export const Permission = {
  READ_PRODUCTS: 'read_products',
  WRITE_PRODUCTS: 'write_products',
  READ_PRODUCT_VARIANTS: 'read_product_variants',
  WRITE_PRODUCT_VARIANTS: 'write_product_variants',
  READ_CATEGORIES: 'read_categories',
  WRITE_CATEGORIES: 'write_categories',
  READ_COLLECTIONS: 'read_collections',
  WRITE_COLLECTIONS: 'write_collections',
  READ_BRANDS: 'read_brands',
  WRITE_BRANDS: 'write_brands',
  READ_USERS: 'read_users',
  WRITE_USERS: 'write_users',
  READ_OPTIONS: 'read_options',
  WRITE_OPTIONS: 'write_options',
  READ_OPTION_VALUES: 'read_option_values',
  WRITE_OPTION_VALUES: 'write_option_values',
  READ_IMAGES: 'read_images',
  WRITE_IMAGES: 'write_images',
  READ_BRAND_REQUESTS: 'read_brand_requests',
  WRITE_BRAND_REQUESTS: 'write_brand_requests',
  READ_ORDERS: 'read_orders',
  WRITE_ORDERS: 'write_orders',
} as const

export type PermissionName = (typeof Permission)[keyof typeof Permission]

export function can(user: User | undefined | null, permission: PermissionName): boolean {
  if (!user) {return false}

  return user.permissions.includes(permission)
}

export function canAny(user: User | undefined | null, permissions: PermissionName[]): boolean {
  if (!user) {return false}

  return permissions.some((permission) => user.permissions.includes(permission))
}

export function canAll(user: User | undefined | null, permissions: PermissionName[]): boolean {
  if (!user) {return false}

  return permissions.every((permission) => user.permissions.includes(permission))
}