/**
 * Конфигурация меню для sidebar админки
 * Использует PrimeIcons для иконок
 * Поддерживает вложенность, разделители
 */

export const sidebarMenuConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        route: 'sb.admin.dashboard'
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: 'pi pi-user',
        route: 'sb.admin.profile.edit'
    },
    {
        id: 'products',
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        children: [
            {
                id: 'all-products',
                label: 'All Products',
                icon: 'pi pi-box',
                href: '/admin/products'
            },
            {
                id: 'variants',
                label: 'Variants',
                icon: 'pi pi-clone',
                href: '/admin/variants'
            },
            {
                id: 'options',
                label: 'Options',
                icon: 'pi pi-sliders-h',
                href: '/admin/options'
            }
        ]
    },
    {
        id: 'catalog',
        label: 'Catalog',
        icon: 'pi pi-folder',
        children: [
            {
                id: 'categories',
                label: 'Categories',
                icon: 'pi pi-tags',
                href: '/admin/categories'
            },
            {
                id: 'collections',
                label: 'Collections',
                icon: 'pi pi-objects-column',
                href: '/admin/collections'
            },
            {
                id: 'brands',
                label: 'Brands',
                icon: 'pi pi-bookmark',
                href: '/admin/brands'
            }
        ]
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: 'pi pi-list',
        href: '/admin/orders',
        divider: true
    },
    {
        id: 'customers',
        label: 'Customers',
        icon: 'pi pi-users',
        href: '/admin/customers'
    },
    {
        id: 'media',
        label: 'Media',
        icon: 'pi pi-image',
        children: [
            {
                id: 'images',
                label: 'Images',
                icon: 'pi pi-images',
                href: '/admin/images'
            }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        divider: true,
        children: [
            {
                id: 'users',
                label: 'Users',
                icon: 'pi pi-user-edit',
                route: 'sb.admin.users.index'
            },
            {
                id: 'filament',
                label: 'Filament Admin',
                icon: 'pi pi-home',
                href: '/admin'
            }
        ]
    }
];