/**
 * Конфигурация меню для sidebar админки
 * Использует PrimeIcons для иконок
 *
 * Структура элемента меню:
 * {
 *   id: string              - Уникальный идентификатор
 *   label: string           - Текст пункта меню
 *   icon: string            - PrimeIcon класс (pi pi-xxx)
 *   route?: string          - Название Laravel route (через Ziggy)
 *   href?: string           - Прямая ссылка (альтернатива route)
 *   target?: string         - '_blank' для внешних ссылок
 *   badge?: object          - { value: number|string, severity: 'danger'|'warning'|'info'|'success' }
 *   roles?: string[]        - Роли с доступом ['admin', 'manager']
 *   dividerBefore?: boolean - Разделитель перед пунктом
 *   dividerAfter?: boolean  - Разделитель после пункта
 *   tooltip?: string        - Подсказка для collapsed режима
 *   children?: array        - Вложенные пункты меню
 * }
 */

export const sidebarMenuConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        route: 'sb.admin.dashboard',
        tooltip: 'Dashboard'
    },
    {
        id: 'products',
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        tooltip: 'Products',
        dividerBefore: true,
        children: [
            {
                id: 'all-products',
                label: 'All Products',
                icon: 'pi pi-box',
                route: 'sb.admin.products.index'
            },
            {
                id: 'add-product',
                label: 'Add Product',
                icon: 'pi pi-plus',
                route: 'sb.admin.products.create'
            },
            {
                id: 'categories',
                label: 'Categories',
                icon: 'pi pi-tags',
                route: 'sb.admin.categories.index'
            },
            {
                id: 'collections',
                label: 'Collections',
                icon: 'pi pi-objects-column',
                route: 'sb.admin.collections.index'
            }
        ]
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: 'pi pi-shopping-cart',
        tooltip: 'Orders',
        badge: { value: 0, severity: 'danger', key: 'pendingOrders' },
        children: [
            {
                id: 'all-orders',
                label: 'All Orders',
                icon: 'pi pi-list',
                route: 'sb.admin.orders.index'
            },
            {
                id: 'pending-orders',
                label: 'Pending',
                icon: 'pi pi-clock',
                route: 'sb.admin.orders.pending',
                badge: { value: 0, severity: 'warning', key: 'pendingOrders' }
            },
            {
                id: 'completed-orders',
                label: 'Completed',
                icon: 'pi pi-check-circle',
                route: 'sb.admin.orders.completed'
            }
        ]
    },
    {
        id: 'customers',
        label: 'Customers',
        icon: 'pi pi-users',
        route: 'sb.admin.customers.index',
        tooltip: 'Customers'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        tooltip: 'Settings',
        dividerBefore: true,
        roles: ['admin'],
        children: [
            {
                id: 'general-settings',
                label: 'General',
                icon: 'pi pi-sliders-h',
                route: 'sb.admin.settings.general'
            },
            {
                id: 'brands-settings',
                label: 'Brands',
                icon: 'pi pi-bookmark',
                route: 'sb.admin.settings.brands'
            },
            {
                id: 'users-settings',
                label: 'Users',
                icon: 'pi pi-user-edit',
                route: 'sb.admin.settings.users',
                roles: ['admin']
            }
        ]
    },
    {
        id: 'filament',
        label: 'Filament Admin',
        icon: 'pi pi-external-link',
        href: '/admin',
        target: '_blank',
        tooltip: 'Open Filament',
        dividerBefore: true,
        roles: ['admin']
    }
];

/**
 * Функция для получения меню с учётом ролей пользователя
 * @param {string[]} userRoles - Роли текущего пользователя
 * @returns {array} - Отфильтрованное меню
 */
export function getMenuForRoles(userRoles = []) {
    const filterByRoles = (items) => {
        return items
            .filter(item => {
                if (!item.roles || item.roles.length === 0) return true;
                return item.roles.some(role => userRoles.includes(role));
            })
            .map(item => {
                if (item.children) {
                    return {
                        ...item,
                        children: filterByRoles(item.children)
                    };
                }
                return item;
            })
            .filter(item => !item.children || item.children.length > 0);
    };

    return filterByRoles(sidebarMenuConfig);
}

/**
 * Преобразование конфига в формат PrimeVue PanelMenu
 * @param {array} menuConfig - Конфигурация меню
 * @param {function} routeFn - Функция route() от Ziggy
 * @param {string} currentPath - Текущий путь для определения активного пункта
 * @param {object} badgeValues - Объект со значениями badges { pendingOrders: 5, ... }
 * @returns {array} - Меню в формате PrimeVue
 */
export function transformToPrimeVueMenu(menuConfig, routeFn, currentPath = '', badgeValues = {}) {
    const transform = (items) => {
        return items.map(item => {
            const menuItem = {
                key: item.id,
                label: item.label,
                icon: item.icon,
                badge: item.badge ? (badgeValues[item.badge.key] || item.badge.value) : null,
                badgeSeverity: item.badge?.severity,
                tooltip: item.tooltip
            };

            // URL
            if (item.route) {
                try {
                    menuItem.url = routeFn(item.route);
                } catch (e) {
                    console.warn(`Route not found: ${item.route}`);
                    menuItem.url = '#';
                }
            } else if (item.href) {
                menuItem.url = item.href;
            }

            // External link
            if (item.target) {
                menuItem.target = item.target;
            }

            // Active state
            if (menuItem.url && currentPath) {
                menuItem.class = currentPath.startsWith(menuItem.url) ? 'active-menu-item' : '';
            }

            // Children
            if (item.children && item.children.length > 0) {
                menuItem.items = transform(item.children);
                // Expand if any child is active
                const hasActiveChild = menuItem.items.some(child =>
                    child.class === 'active-menu-item' ||
                    (child.items && child.items.some(c => c.class === 'active-menu-item'))
                );
                if (hasActiveChild) {
                    menuItem.expanded = true;
                    menuItem.class = 'has-active-child';
                }
            }

            return menuItem;
        });
    };

    return transform(menuConfig);
}