<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { Link, usePage, router } from '@inertiajs/vue3';
import { sidebarMenuConfig, getMenuForRoles } from '@/config/sidebarMenu.js';
import Badge from 'primevue/badge';
import Popover from 'primevue/popover';

const props = defineProps({
    collapsed: {
        type: Boolean,
        default: false
    },
    badgeValues: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['item-click']);

const page = usePage();

// Реактивный путь - обновляется при каждой навигации Inertia
const currentPath = ref('');

const userRoles = computed(() => page.props.auth?.user?.roles || ['admin']);

// Получаем меню с учётом ролей
const filteredMenu = computed(() => {
    return getMenuForRoles(userRoles.value);
});

// Состояние раскрытых групп
const expandedKeys = ref({});

// Popup подменю для collapsed режима
const overlayPanelRefs = ref({});
const activePopupItem = ref(null);
const hoverTimeout = ref(null);
const isOverPopup = ref(false);

// Получаем URL для пункта меню (полный URL для ссылок)
function getItemUrl(item) {
    if (item.route) {
        try {
            return route(item.route);
        } catch (e) {
            console.warn(`Route not found: ${item.route}`);
            return '#';
        }
    }
    return item.href || '#';
}

// Извлекаем pathname из URL (убираем домен)
function getPathFromUrl(url) {
    if (!url || url === '#') return '';
    try {
        // Если это полный URL с протоколом - извлекаем pathname
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return new URL(url).pathname;
        }
        // Если это уже путь - возвращаем как есть
        return url;
    } catch (e) {
        return url;
    }
}

// Проверяем активен ли пункт меню (только точное совпадение)
function checkIsActive(item, path) {
    const fullUrl = getItemUrl(item);
    const url = getPathFromUrl(fullUrl);

    if (!url) return false;

    // Нормализуем пути (убираем trailing slash)
    const normalizedPath = path.replace(/\/$/, '');
    const normalizedUrl = url.replace(/\/$/, '');

    // Только точное совпадение URL
    return normalizedPath === normalizedUrl;
}

// Инициализация раскрытых групп на основе текущего пути
function initExpandedState() {
    const path = currentPath.value;
    if (!path) return;

    filteredMenu.value.forEach(item => {
        if (item.children && item.children.length > 0) {
            const hasActiveChild = item.children.some(child => checkIsActive(child, path));
            if (hasActiveChild) {
                expandedKeys.value[item.id] = true;
            }
        }
    });
}

// Обновляем путь и состояние меню
function updateCurrentPath(newPath) {
    currentPath.value = newPath.split('?')[0]; // Убираем query params
    nextTick(() => {
        initExpandedState();
    });
}

// Слушаем события навигации Inertia
onMounted(() => {
    // Инициализация при первой загрузке
    updateCurrentPath(window.location.pathname);

    // Подписка на события навигации Inertia
    router.on('navigate', (event) => {
        updateCurrentPath(event.detail.page.url);
    });
});

function toggleExpand(itemId) {
    expandedKeys.value[itemId] = !expandedKeys.value[itemId];
}

function isExpanded(itemId) {
    return expandedKeys.value[itemId] || false;
}

function isActive(item) {
    return checkIsActive(item, currentPath.value);
}

function isGroupActive(item) {
    if (!item.children) return false;
    return item.children.some(child => isActive(child));
}

function getBadgeValue(item) {
    if (!item.badge) return null;
    return props.badgeValues[item.badge.key] || item.badge.value || null;
}

function getBadgeSeverity(item) {
    return item.badge?.severity || 'info';
}

function handleItemClick(item, event) {
    if (item.children && item.children.length > 0) {
        event.preventDefault();
        toggleExpand(item.id);
    } else {
        emit('item-click', item);
    }
}

// Popup подменю handlers
function setOverlayPanelRef(el, itemId) {
    if (el) {
        overlayPanelRefs.value[itemId] = el;
    }
}

function showPopupSubmenu(event, item) {
    if (!props.collapsed || !item.children || item.children.length === 0) return;

    clearTimeout(hoverTimeout.value);

    // Закрываем предыдущий popup, если он открыт
    if (activePopupItem.value && activePopupItem.value.id !== item.id) {
        const prevPanel = overlayPanelRefs.value[activePopupItem.value.id];
        if (prevPanel) {
            prevPanel.hide();
        }
    }

    activePopupItem.value = item;

    // Получаем позицию элемента для правильного позиционирования popup
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    nextTick(() => {
        const panel = overlayPanelRefs.value[item.id];
        if (panel) {
            panel.show(event);

            // Позиционируем popup справа от сайдбара
            nextTick(() => {
                const panelEl = panel.$el;
                if (panelEl) {
                    panelEl.style.left = '80px';
                    panelEl.style.top = `${rect.top}px`;
                }
            });
        }
    });
}

function hidePopupSubmenu(item) {
    if (!props.collapsed) return;

    hoverTimeout.value = setTimeout(() => {
        if (!isOverPopup.value) {
            const panel = overlayPanelRefs.value[item.id];
            if (panel) {
                panel.hide();
            }
            activePopupItem.value = null;
        }
    }, 150);
}

function onPopupEnter() {
    isOverPopup.value = true;
    clearTimeout(hoverTimeout.value);
}

function onPopupLeave(item) {
    isOverPopup.value = false;
    hidePopupSubmenu(item);
}

function handlePopupItemClick(child) {
    // Закрываем popup после клика
    if (activePopupItem.value) {
        const panel = overlayPanelRefs.value[activePopupItem.value.id];
        if (panel) {
            panel.hide();
        }
        activePopupItem.value = null;
    }
    emit('item-click', child);
}
</script>

<template>
    <nav class="admin-sidebar" :class="{ 'collapsed': collapsed }">
        <ul class="sidebar-menu">
            <template v-for="item in filteredMenu" :key="item.id">
                <!-- Divider -->
                <li v-if="item.dividerBefore" class="menu-divider"></li>

                <!-- Menu Item -->
                <li
                    class="menu-item"
                    :class="{
                        'active': isActive(item),
                        'has-children': item.children && item.children.length > 0,
                        'expanded': isExpanded(item.id),
                        'group-active': isGroupActive(item)
                    }"
                >
                    <!-- Item with children (expandable) -->
                    <template v-if="item.children && item.children.length > 0">
                        <a
                            href="#"
                            class="menu-link"
                            @click="handleItemClick(item, $event)"
                            @mouseenter="showPopupSubmenu($event, item)"
                            @mouseleave="hidePopupSubmenu(item)"
                        >
                            <span class="menu-icon">
                                <i :class="item.icon"></i>
                            </span>
                            <span class="menu-label" v-show="!collapsed">{{ item.label }}</span>
                            <Badge
                                v-if="getBadgeValue(item) && !collapsed"
                                :value="getBadgeValue(item)"
                                :severity="getBadgeSeverity(item)"
                                class="menu-badge"
                            />
                            <span class="menu-arrow" v-show="!collapsed">
                                <i class="pi" :class="isExpanded(item.id) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                            </span>
                        </a>

                        <!-- Popup Submenu for collapsed mode -->
                        <Popover
                            v-if="collapsed"
                            :ref="(el) => setOverlayPanelRef(el, item.id)"
                            class="popup-submenu-panel"
                            appendTo="body"
                            @mouseenter="onPopupEnter"
                            @mouseleave="onPopupLeave(item)"
                        >
                            <div class="popup-submenu-header">
                                <i :class="item.icon"></i>
                                <span>{{ item.label }}</span>
                            </div>
                            <ul class="popup-submenu-list">
                                <li
                                    v-for="child in item.children"
                                    :key="child.id"
                                    class="popup-submenu-item"
                                    :class="{ 'active': isActive(child) }"
                                >
                                    <Link
                                        v-if="!child.target"
                                        :href="getItemUrl(child)"
                                        class="popup-submenu-link"
                                        @click="handlePopupItemClick(child)"
                                    >
                                        <span class="menu-icon">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="menu-label">{{ child.label }}</span>
                                        <Badge
                                            v-if="getBadgeValue(child)"
                                            :value="getBadgeValue(child)"
                                            :severity="getBadgeSeverity(child)"
                                            class="menu-badge"
                                        />
                                    </Link>
                                    <a
                                        v-else
                                        :href="getItemUrl(child)"
                                        :target="child.target"
                                        class="popup-submenu-link"
                                        @click="handlePopupItemClick(child)"
                                    >
                                        <span class="menu-icon">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="menu-label">{{ child.label }}</span>
                                        <i v-if="child.target === '_blank'" class="pi pi-external-link external-icon"></i>
                                    </a>
                                </li>
                            </ul>
                        </Popover>

                        <!-- Submenu (expanded mode) -->
                        <ul v-show="isExpanded(item.id) && !collapsed" class="submenu">
                                <li
                                    v-for="child in item.children"
                                    :key="child.id"
                                    class="submenu-item"
                                    :class="{ 'active': isActive(child) }"
                                >
                                    <Link
                                        v-if="!child.target"
                                        :href="getItemUrl(child)"
                                        class="submenu-link"
                                        @click="emit('item-click', child)"
                                    >
                                        <span class="menu-icon">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="menu-label">{{ child.label }}</span>
                                        <Badge
                                            v-if="getBadgeValue(child)"
                                            :value="getBadgeValue(child)"
                                            :severity="getBadgeSeverity(child)"
                                            class="menu-badge"
                                        />
                                    </Link>
                                    <a
                                        v-else
                                        :href="getItemUrl(child)"
                                        :target="child.target"
                                        class="submenu-link"
                                    >
                                        <span class="menu-icon">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="menu-label">{{ child.label }}</span>
                                        <i v-if="child.target === '_blank'" class="pi pi-external-link external-icon"></i>
                                    </a>
                                </li>
                            </ul>
                    </template>

                    <!-- Simple item (link) -->
                    <template v-else>
                        <Link
                            v-if="!item.target"
                            :href="getItemUrl(item)"
                            class="menu-link"
                            :class="{ 'active': isActive(item) }"
                            v-tooltip.right="collapsed ? item.tooltip || item.label : null"
                            @click="emit('item-click', item)"
                        >
                            <span class="menu-icon">
                                <i :class="item.icon"></i>
                            </span>
                            <span class="menu-label" v-show="!collapsed">{{ item.label }}</span>
                            <Badge
                                v-if="getBadgeValue(item) && !collapsed"
                                :value="getBadgeValue(item)"
                                :severity="getBadgeSeverity(item)"
                                class="menu-badge"
                            />
                        </Link>
                        <a
                            v-else
                            :href="getItemUrl(item)"
                            :target="item.target"
                            class="menu-link"
                            v-tooltip.right="collapsed ? item.tooltip || item.label : null"
                        >
                            <span class="menu-icon">
                                <i :class="item.icon"></i>
                            </span>
                            <span class="menu-label" v-show="!collapsed">{{ item.label }}</span>
                            <i v-if="item.target === '_blank' && !collapsed" class="pi pi-external-link external-icon"></i>
                        </a>
                    </template>
                </li>

                <!-- Divider After -->
                <li v-if="item.dividerAfter" class="menu-divider"></li>
            </template>
        </ul>
    </nav>
</template>

<style scoped>
.admin-sidebar {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem;
}

.admin-sidebar::-webkit-scrollbar {
    width: 4px;
}

.admin-sidebar::-webkit-scrollbar-track {
    background: transparent;
}

.admin-sidebar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

.sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* Menu Divider */
.menu-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
    margin: 0.75rem 0.5rem;
}

/* Menu Item */
.menu-item {
    margin-bottom: 2px;
}

/* Menu Link */
.menu-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
}

.menu-link:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #4f46e5;
}

.menu-link.active,
.menu-item.active > .menu-link {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.menu-item.group-active > .menu-link {
    color: #4f46e5;
    background: rgba(99, 102, 241, 0.08);
}

/* Menu Icon */
.menu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.125rem;
    flex-shrink: 0;
}

/* Menu Label */
.menu-label {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Menu Arrow */
.menu-arrow {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    transition: transform 0.2s ease;
}

.menu-item.expanded .menu-arrow i {
    transform: rotate(0deg);
}

/* Menu Badge */
.menu-badge {
    margin-left: auto;
    font-size: 0.7rem;
    min-width: 1.25rem;
    height: 1.25rem;
}

/* External Link Icon */
.external-icon {
    font-size: 0.7rem;
    opacity: 0.6;
    margin-left: 0.25rem;
}

/* Submenu */
.submenu {
    list-style: none;
    padding: 0.25rem 0 0.25rem 0;
    margin: 0;
    overflow: hidden;
}

.submenu-item {
    margin-bottom: 1px;
}

.submenu-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    border-radius: 0.375rem;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s ease;
    font-size: 0.8125rem;
}

.submenu-link:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #4f46e5;
}

.submenu-item.active .submenu-link {
    background: rgba(99, 102, 241, 0.12);
    color: #4f46e5;
    font-weight: 600;
}

.submenu-item.active .submenu-link .menu-icon {
    color: #4f46e5;
}

.submenu-link .menu-icon {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
}

/* Collapsed State */
.admin-sidebar.collapsed .menu-link {
    justify-content: center;
    padding: 0.875rem;
}

.admin-sidebar.collapsed .menu-icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.25rem;
}

.admin-sidebar.collapsed .menu-item.has-children > .menu-link::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.5;
}

/* Collapsed badge indicator */
.admin-sidebar.collapsed .menu-item:has(.menu-badge) > .menu-link::before {
    content: '';
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
}
</style>

<!-- Global styles for popup (not scoped) -->
<style>
/* Popup Submenu Panel - позиционирование справа от collapsed сайдбара */
.p-popover.popup-submenu-panel {
    min-width: 200px !important;
    max-width: 280px !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid #e2e8f0 !important;
    overflow: hidden !important;
    /* Фиксированная позиция слева - справа от сайдбара 72px + 8px отступ */
    left: 70px !important;
    margin-top: -40px !important;
    transform: none !important;
}

.p-popover.popup-submenu-panel::before,
.p-popover.popup-submenu-panel::after {
    display: none !important;
}

.popup-submenu-panel .p-popover-content {
    padding: 0 !important;
}

.popup-submenu-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
}

.popup-submenu-header i {
    font-size: 1rem;
}

.popup-submenu-list {
    list-style: none;
    padding: 0.5rem;
    margin: 0;
}

.popup-submenu-item {
    margin-bottom: 2px;
}

.popup-submenu-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.375rem;
    color: #64748b;
    text-decoration: none;
    transition: all 0.15s ease;
    font-size: 0.8125rem;
}

.popup-submenu-link:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #4f46e5;
}

.popup-submenu-item.active .popup-submenu-link {
    background: rgba(99, 102, 241, 0.12);
    color: #4f46e5;
    font-weight: 600;
}

.popup-submenu-link .menu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.popup-submenu-link .menu-label {
    flex: 1;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.popup-submenu-link .menu-badge {
    margin-left: auto;
    font-size: 0.65rem;
    min-width: 1.125rem;
    height: 1.125rem;
}

.popup-submenu-link .external-icon {
    font-size: 0.65rem;
    opacity: 0.6;
    margin-left: 0.25rem;
}
</style>
