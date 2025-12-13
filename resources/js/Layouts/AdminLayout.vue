<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import AdminSidebar from '@/Components/Admin/AdminSidebar.vue';

const STORAGE_KEY = 'admin_sidebar_collapsed';
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const page = usePage();
const user = computed(() => page.props.auth.user);

// Состояние sidebar
const sidebarCollapsed = ref(false);
const mobileSidebarVisible = ref(false);
const userMenuRef = ref();

// Определение устройства
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const isMobile = computed(() => windowWidth.value < MOBILE_BREAKPOINT);
const isTablet = computed(() => windowWidth.value >= MOBILE_BREAKPOINT && windowWidth.value < TABLET_BREAKPOINT);
const isDesktop = computed(() => windowWidth.value >= TABLET_BREAKPOINT);

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

    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});

function updateWindowWidth() {
    windowWidth.value = window.innerWidth;

    // Автоматически скрываем мобильный sidebar при ресайзе на десктоп
    if (!isMobile.value) {
        mobileSidebarVisible.value = false;
    }
}

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
    background: #f8fafc;
}

/* Desktop Sidebar */
.desktop-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
}

.desktop-sidebar.collapsed {
    width: 72px;
}

/* Sidebar Header */
.sidebar-header {
    padding: 1.25rem;
    border-bottom: 1px solid #e2e8f0;
}

.brand-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #1e293b;
}

.brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.brand-text {
    font-size: 1.375rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 0.75rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
}

.collapse-btn {
    color: #64748b;
    transition: all 0.2s;
}

.collapse-btn:hover {
    color: #4f46e5;
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
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e2e8f0;
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
    color: #64748b;
    flex-shrink: 0;
}

.toggle-btn:hover {
    color: #4f46e5;
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
    color: #1e293b;
}

.user-menu-btn:hover {
    background: rgba(99, 102, 241, 0.08);
}

.user-avatar {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
    color: #64748b;
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
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

:deep(.mobile-sidebar-header) {
    padding: 1.25rem;
    border-bottom: 1px solid #e2e8f0;
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
    background: rgba(0, 0, 0, 0.3);
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