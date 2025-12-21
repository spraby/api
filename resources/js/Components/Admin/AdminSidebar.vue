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
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return new URL(url).pathname;
        }
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

    const normalizedPath = path.replace(/\/$/, '');
    const normalizedUrl = url.replace(/\/$/, '');

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
    currentPath.value = newPath.split('?')[0];
    nextTick(() => {
        initExpandedState();
    });
}

// Слушаем события навигации Inertia
onMounted(() => {
    updateCurrentPath(window.location.pathname);

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

    if (activePopupItem.value && activePopupItem.value.id !== item.id) {
        const prevPanel = overlayPanelRefs.value[activePopupItem.value.id];
        if (prevPanel) {
            prevPanel.hide();
        }
    }

    activePopupItem.value = item;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    nextTick(() => {
        const panel = overlayPanelRefs.value[item.id];
        if (panel) {
            panel.show(event);

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
    if (activePopupItem.value) {
        const panel = overlayPanelRefs.value[activePopupItem.value.id];
        if (panel) {
            panel.hide();
        }
        activePopupItem.value = null;
    }
    emit('item-click', child);
}

// Computed classes
const menuLinkClasses = computed(() => (item) => {
    const base = 'flex items-center gap-3 py-3 px-4 rounded-lg no-underline transition-all duration-200 cursor-pointer relative';
    const inactive = 'text-app-secondary';
    const hover = 'hover:bg-primary-500/10 hover:text-primary-500';

    if (isActive(item)) {
        return `${base} bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/35`;
    }
    if (isGroupActive(item)) {
        return `${base} ${hover} text-primary-500 bg-primary-500/10`;
    }
    return `${base} ${inactive} ${hover}`;
});

const submenuLinkClasses = computed(() => (child) => {
    const base = 'flex items-center gap-3 py-2.5 pl-10 pr-4 rounded-md no-underline transition-all duration-200 text-[13px]';
    const inactive = 'text-app-secondary';
    const hover = 'hover:bg-primary-500/10 hover:text-primary-500';

    if (isActive(child)) {
        return `${base} bg-primary-500/15 text-primary-500 font-semibold`;
    }
    return `${base} ${inactive} ${hover}`;
});
</script>

<template>
    <nav class="h-full overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
        <ul class="list-none p-0 m-0">
            <template v-for="item in filteredMenu" :key="item.id">
                <!-- Divider -->
                <li v-if="item.dividerBefore" class="h-px bg-linear-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-3 mx-2"></li>

                <!-- Menu Item -->
                <li class="mb-0.5">
                    <!-- Item with children (expandable) -->
                    <template v-if="item.children && item.children.length > 0">
                        <a
                            href="#"
                            :class="[
                                menuLinkClasses(item),
                                collapsed && 'justify-center p-3.5!'
                            ]"
                            @click="handleItemClick(item, $event)"
                            @mouseenter="showPopupSubmenu($event, item)"
                            @mouseleave="hidePopupSubmenu(item)"
                        >
                            <span :class="['flex items-center justify-center shrink-0', collapsed ? 'w-7 h-7 text-xl' : 'w-6 h-6 text-lg']">
                                <i :class="item.icon"></i>
                            </span>
                            <span v-show="!collapsed" class="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {{ item.label }}
                            </span>
                            <Badge
                                v-if="getBadgeValue(item) && !collapsed"
                                :value="getBadgeValue(item)"
                                :severity="getBadgeSeverity(item)"
                                class="ml-auto text-[11px] min-w-5 h-5"
                            />
                            <span v-show="!collapsed" class="flex items-center text-xs transition-transform duration-200">
                                <i class="pi" :class="isExpanded(item.id) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                            </span>
                            <!-- Collapsed indicator dot -->
                            <span v-if="collapsed" class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-50"></span>
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
                            <div class="flex items-center gap-2 px-4 py-3 bg-linear-to-br from-primary-500 to-primary-600 text-white font-semibold text-sm">
                                <i :class="item.icon" class="text-base"></i>
                                <span>{{ item.label }}</span>
                            </div>
                            <ul class="list-none p-2 m-0">
                                <li v-for="child in item.children" :key="child.id" class="mb-0.5">
                                    <Link
                                        v-if="!child.target"
                                        :href="getItemUrl(child)"
                                        class="flex items-center gap-3 px-3 py-2.5 rounded-md text-app-secondary no-underline transition-all duration-150 text-sm hover:bg-primary-500/10 hover:text-primary-500"
                                        :class="{ 'bg-primary-500/15 text-primary-500 font-semibold': isActive(child) }"
                                        @click="handlePopupItemClick(child)"
                                    >
                                        <span class="flex items-center justify-center w-5 h-5 text-sm shrink-0">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ child.label }}</span>
                                        <Badge
                                            v-if="getBadgeValue(child)"
                                            :value="getBadgeValue(child)"
                                            :severity="getBadgeSeverity(child)"
                                            class="ml-auto text-xs"
                                        />
                                    </Link>
                                    <a
                                        v-else
                                        :href="getItemUrl(child)"
                                        :target="child.target"
                                        class="flex items-center gap-3 px-3 py-2.5 rounded-md text-app-secondary no-underline transition-all duration-150 text-sm hover:bg-primary-500/10 hover:text-primary-500"
                                        :class="{ 'bg-primary-500/15 text-primary-500 font-semibold': isActive(child) }"
                                        @click="handlePopupItemClick(child)"
                                    >
                                        <span class="flex items-center justify-center w-5 h-5 text-sm shrink-0">
                                            <i :class="child.icon"></i>
                                        </span>
                                        <span class="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ child.label }}</span>
                                        <i v-if="child.target === '_blank'" class="pi pi-external-link text-xs opacity-60 ml-1"></i>
                                    </a>
                                </li>
                            </ul>
                        </Popover>

                        <!-- Submenu (expanded mode) -->
                        <ul v-show="isExpanded(item.id) && !collapsed" class="list-none py-1 m-0 overflow-hidden">
                            <li v-for="child in item.children" :key="child.id" class="mb-px">
                                <Link
                                    v-if="!child.target"
                                    :href="getItemUrl(child)"
                                    :class="submenuLinkClasses(child)"
                                    @click="emit('item-click', child)"
                                >
                                    <span class="flex items-center justify-center w-5 h-5 text-sm shrink-0">
                                        <i :class="child.icon"></i>
                                    </span>
                                    <span class="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ child.label }}</span>
                                    <Badge
                                        v-if="getBadgeValue(child)"
                                        :value="getBadgeValue(child)"
                                        :severity="getBadgeSeverity(child)"
                                        class="ml-auto text-[11px] min-w-5 h-5"
                                    />
                                </Link>
                                <a
                                    v-else
                                    :href="getItemUrl(child)"
                                    :target="child.target"
                                    :class="submenuLinkClasses(child)"
                                >
                                    <span class="flex items-center justify-center w-5 h-5 text-sm shrink-0">
                                        <i :class="child.icon"></i>
                                    </span>
                                    <span class="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ child.label }}</span>
                                    <i v-if="child.target === '_blank'" class="pi pi-external-link text-[11px] opacity-60 ml-1"></i>
                                </a>
                            </li>
                        </ul>
                    </template>

                    <!-- Simple item (link) -->
                    <template v-else>
                        <Link
                            v-if="!item.target"
                            :href="getItemUrl(item)"
                            :class="[
                                menuLinkClasses(item),
                                collapsed && 'justify-center p-3.5!'
                            ]"
                            v-tooltip.right="collapsed ? item.tooltip || item.label : null"
                            @click="emit('item-click', item)"
                        >
                            <span :class="['flex items-center justify-center shrink-0', collapsed ? 'w-7 h-7 text-xl' : 'w-6 h-6 text-lg']">
                                <i :class="item.icon"></i>
                            </span>
                            <span v-show="!collapsed" class="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {{ item.label }}
                            </span>
                            <Badge
                                v-if="getBadgeValue(item) && !collapsed"
                                :value="getBadgeValue(item)"
                                :severity="getBadgeSeverity(item)"
                                class="ml-auto text-[11px] min-w-5 h-5"
                            />
                        </Link>
                        <a
                            v-else
                            :href="getItemUrl(item)"
                            :target="item.target"
                            :class="[
                                menuLinkClasses(item),
                                collapsed && 'justify-center p-3.5!'
                            ]"
                            v-tooltip.right="collapsed ? item.tooltip || item.label : null"
                        >
                            <span :class="['flex items-center justify-center shrink-0', collapsed ? 'w-7 h-7 text-xl' : 'w-6 h-6 text-lg']">
                                <i :class="item.icon"></i>
                            </span>
                            <span v-show="!collapsed" class="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {{ item.label }}
                            </span>
                            <i v-if="item.target === '_blank' && !collapsed" class="pi pi-external-link text-[11px] opacity-60 ml-1"></i>
                        </a>
                    </template>
                </li>

                <!-- Divider After -->
                <li v-if="item.dividerAfter" class="h-px bg-linear-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-3 mx-2"></li>
            </template>
        </ul>
    </nav>
</template>

<!-- Global styles for Popover positioning (cannot use Tailwind here - renders to body) -->
<style>
.p-popover.popup-submenu-panel {
    min-width: 200px !important;
    max-width: 280px !important;
    border-radius: 0.75rem !important;
    box-shadow: var(--shadow-lg) !important;
    border: 1px solid var(--app-border) !important;
    background: var(--app-card-bg) !important;
    overflow: hidden !important;
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
    background: transparent !important;
}

/* Popover menu items - unified color scheme */
.popup-submenu-panel a {
    color: var(--text-secondary) !important;
}

.popup-submenu-panel a:hover {
    color: #6366f1 !important;
    background: rgba(99, 102, 241, 0.1) !important;
}

/* Active item in popup */
.popup-submenu-panel a.bg-primary-500\/15 {
    color: #6366f1 !important;
    background: rgba(99, 102, 241, 0.15) !important;
}

/* Header gradient in popup */
.popup-submenu-panel .bg-linear-to-br {
    background: linear-gradient(to bottom right, #6366f1, #4f46e5) !important;
}
</style>
