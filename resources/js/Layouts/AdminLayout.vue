<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import AdminSidebar from '@/Components/Admin/AdminSidebar.vue';
import ThemeToggle from '@/Components/Admin/ThemeToggle.vue';

const STORAGE_KEY = 'admin_sidebar_collapsed';

const page = usePage();
const user = computed(() => page.props.auth.user);

// Состояние sidebar
const sidebarCollapsed = ref(false);
const mobileSidebarVisible = ref(false);
const userMenuRef = ref();

// Определение устройства через VueUse
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');  // < 768px
const isTablet = breakpoints.between('md', 'lg');  // 768px - 1024px

// Badge values (можно получать из props или API)
const badgeValues = computed(() => ({
    pendingOrders: page.props.pendingOrdersCount || 0
}));

// Инициализация
onMounted(() => {
    // Восстанавливаем состояние из localStorage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState !== null) {
        sidebarCollapsed.value = savedState === 'true';
    }

    // Устанавливаем начальное состояние для планшетов
    if (isTablet.value) {
        sidebarCollapsed.value = true;
    }
});

// Автоматически скрываем мобильный sidebar при переходе на десктоп (VueUse отслеживает resize)
watch(isMobile, (mobile) => {
    if (!mobile) {
        mobileSidebarVisible.value = false;
    }
});

// Сохранение состояния при изменении
watch(sidebarCollapsed, (value) => {
    if (!isMobile.value) {
        localStorage.setItem(STORAGE_KEY, String(value));
    }
});

function toggleSidebar() {
    if (isMobile.value) {
        mobileSidebarVisible.value = !mobileSidebarVisible.value;
    } else {
        sidebarCollapsed.value = !sidebarCollapsed.value;
    }
}

function handleMenuItemClick() {
    // Закрываем мобильный sidebar при клике на пункт меню
    if (isMobile.value) {
        mobileSidebarVisible.value = false;
    }
}

const userMenuItems = ref([
    {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
            window.location.href = route('sb.admin.profile.edit');
        }
    },
    {
        separator: true
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
            window.location.href = route('sb.admin.logout');
        }
    }
]);

function toggleUserMenu(event) {
    userMenuRef.value.toggle(event);
}

// Ширина sidebar
const sidebarWidth = computed(() => {
    if (isMobile.value) return '0px';
    return sidebarCollapsed.value ? '72px' : '280px';
});
</script>

<template>
    <div class="admin-layout">
        <!-- Desktop/Tablet Sidebar -->
        <aside
            v-if="!isMobile"
            class="desktop-sidebar"
            :class="{ 'collapsed': sidebarCollapsed }"
        >
            <!-- Sidebar Header -->
            <div class="sidebar-header">
                <Link
                    :href="route('sb.admin.dashboard')"
                    class="brand-link"
                >
                    <div class="brand-icon">
                        <i class="pi pi-sparkles"></i>
                    </div>
                    <transition name="fade">
                        <span v-if="!sidebarCollapsed" class="brand-text">
                            Spraby
                        </span>
                    </transition>
                </Link>
            </div>

            <!-- Menu -->
            <AdminSidebar
                :collapsed="sidebarCollapsed"
                :badge-values="badgeValues"
                @item-click="handleMenuItemClick"
            />

            <!-- Sidebar Footer -->
            <div class="sidebar-footer">
                <Button
                    :icon="sidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"
                    @click="toggleSidebar"
                    text
                    rounded
                    class="collapse-btn"
                    v-tooltip.right="sidebarCollapsed ? 'Expand' : 'Collapse'"
                />
            </div>
        </aside>

        <!-- Mobile Sidebar (Drawer) -->
        <Sidebar
            v-model:visible="mobileSidebarVisible"
            :show-close-icon="true"
            class="mobile-sidebar"
            :pt="{
                root: { class: 'mobile-sidebar-root' },
                header: { class: 'mobile-sidebar-header' },
                content: { class: 'mobile-sidebar-content' }
            }"
        >
            <template #header>
                <Link
                    :href="route('sb.admin.dashboard')"
                    class="brand-link mobile"
                    @click="mobileSidebarVisible = false"
                >
                    <div class="brand-icon">
                        <i class="pi pi-sparkles"></i>
                    </div>
                    <span class="brand-text">Spraby</span>
                </Link>
            </template>

            <AdminSidebar
                :collapsed="false"
                :badge-values="badgeValues"
                @item-click="handleMenuItemClick"
            />
        </Sidebar>

        <!-- Main Content Area -->
        <div class="main-wrapper" :style="{ marginLeft: sidebarWidth }">
            <!-- Top Header -->
            <header class="top-header">
                <div class="header-left">
                    <Button
                        :icon="isMobile ? 'pi pi-bars' : (sidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left')"
                        @click="toggleSidebar"
                        text
                        rounded
                        class="toggle-btn"
                        aria-label="Toggle Sidebar"
                    />
                    <div class="header-slot">
                        <slot name="header" />
                    </div>
                </div>

                <div class="header-right">
                    <ThemeToggle />

                    <Button
                        @click="toggleUserMenu"
                        text
                        class="user-menu-btn"
                    >
                        <Avatar
                            :label="user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'"
                            shape="circle"
                            size="normal"
                            class="user-avatar"
                        />
                        <span class="user-name">
                            {{ user?.first_name || user?.email }}
                        </span>
                        <i class="pi pi-chevron-down user-chevron"></i>
                    </Button>
                    <Menu ref="userMenuRef" :model="userMenuItems" popup />
                </div>
            </header>

            <!-- Page Content -->
            <main class="page-content">
                <slot />
            </main>
        </div>

        <!-- Mobile Overlay -->
        <transition name="fade">
            <div
                v-if="mobileSidebarVisible && isMobile"
                class="mobile-overlay"
                @click="mobileSidebarVisible = false"
            />
        </transition>
    </div>
</template>

<style scoped>
.admin-layout {
    min-height: 100vh;
    background: var(--app-background);
}

/* Desktop Sidebar */
.desktop-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: var(--app-sidebar-bg);
    border-right: 1px solid var(--app-border);
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-sm);
}

.desktop-sidebar.collapsed {
    width: 72px;
}

/* Sidebar Header */
.sidebar-header {
    padding: 1.25rem;
    border-bottom: 1px solid var(--app-border);
}

.brand-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--text-primary);
}

.brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    flex-shrink: 0;
    box-shadow: var(--shadow-primary);
}

.brand-text {
    font-size: 1.375rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 0.75rem;
    border-top: 1px solid var(--app-border);
    display: flex;
    justify-content: center;
}

.collapse-btn {
    color: var(--text-secondary);
    transition: all 0.2s;
}

.collapse-btn:hover {
    color: var(--primary-500);
    background: rgba(99, 102, 241, 0.1);
}

/* Main Wrapper */
.main-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Top Header */
.top-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--app-header-bg);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--app-border);
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
}

.toggle-btn {
    color: var(--text-secondary);
    flex-shrink: 0;
}

.toggle-btn:hover {
    color: var(--primary-500);
    background: rgba(99, 102, 241, 0.1);
}

.header-slot {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

/* User Menu Button */
.user-menu-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: var(--text-primary);
}

.user-menu-btn:hover {
    background: rgba(99, 102, 241, 0.08);
}

.user-avatar {
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    font-weight: 600;
}

.user-name {
    font-weight: 500;
    font-size: 0.875rem;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-chevron {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Page Content */
.page-content {
    flex: 1;
    padding: 1.5rem;
}

/* Mobile Sidebar */
.mobile-sidebar {
    width: 300px !important;
}

:deep(.mobile-sidebar-root) {
    background: var(--app-sidebar-bg);
}

:deep(.mobile-sidebar-header) {
    padding: 1.25rem;
    border-bottom: 1px solid var(--app-border);
}

:deep(.mobile-sidebar-content) {
    padding: 0;
}

.brand-link.mobile {
    padding: 0;
}

/* Mobile Overlay */
.mobile-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-bg);
    z-index: 90;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 1023px) {
    .user-name,
    .user-chevron {
        display: none;
    }
}

@media (max-width: 767px) {
    .top-header {
        padding: 0.75rem 1rem;
    }

    .page-content {
        padding: 1rem;
    }
}

@media (min-width: 1024px) {
    .page-content {
        padding: 2rem;
    }
}
</style>