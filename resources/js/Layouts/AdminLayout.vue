<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import PanelMenu from 'primevue/panelmenu';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';

const page = usePage();
const user = computed(() => page.props.auth.user);
const sidebarVisible = ref(true);
const mobileSidebarVisible = ref(false);
const userMenuRef = ref();
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    if (isMobile.value) {
        sidebarVisible.value = false;
    } else {
        sidebarVisible.value = true;
        mobileSidebarVisible.value = false;
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

const toggleSidebar = () => {
    if (isMobile.value) {
        mobileSidebarVisible.value = !mobileSidebarVisible.value;
    } else {
        sidebarVisible.value = !sidebarVisible.value;
    }
};

const menuItems = ref([
    {
        label: 'Dashboard',
        icon: 'pi pi-home',
        url: route('sb.admin.dashboard')
    },
    {
        label: 'Products',
        icon: 'pi pi-box',
        items: [
            {
                label: 'All Products',
                icon: 'pi pi-list',
                url: route('sb.admin.products.index')
            },
            {
                label: 'Add Product',
                icon: 'pi pi-plus',
                url: route('sb.admin.products.create')
            },
            {
                label: 'Categories',
                icon: 'pi pi-tags',
                url: route('sb.admin.categories.index')
            },
            {
                label: 'Collections',
                icon: 'pi pi-folder',
                url: route('sb.admin.collections.index')
            }
        ]
    },
    {
        label: 'Orders',
        icon: 'pi pi-shopping-cart',
        items: [
            {
                label: 'All Orders',
                icon: 'pi pi-list',
                url: route('sb.admin.orders.index')
            },
            {
                label: 'Pending',
                icon: 'pi pi-clock',
                url: route('sb.admin.orders.pending')
            },
            {
                label: 'Completed',
                icon: 'pi pi-check-circle',
                url: route('sb.admin.orders.completed')
            }
        ]
    },
    {
        label: 'Customers',
        icon: 'pi pi-users',
        url: route('sb.admin.customers.index')
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        items: [
            {
                label: 'General',
                icon: 'pi pi-sliders-h',
                url: route('sb.admin.settings.general')
            },
            {
                label: 'Brands',
                icon: 'pi pi-bookmark',
                url: route('sb.admin.settings.brands')
            },
            {
                label: 'Users',
                icon: 'pi pi-user',
                url: route('sb.admin.settings.users')
            }
        ]
    }
]);

const userMenuItems = ref([
    {
        label: 'Profile',
        icon: 'pi pi-user',
        url: route('sb.admin.profile.edit')
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

const toggleUserMenu = (event) => {
    userMenuRef.value.toggle(event);
};
</script>

<template>
    <div class="flex min-h-screen bg-gray-100">
        <!-- Desktop Sidebar -->
        <aside
            v-if="!isMobile"
            :class="[
                'fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
                sidebarVisible ? 'w-72' : 'w-20'
            ]"
        >
            <!-- Sidebar Header -->
            <div class="p-6 border-b border-gray-200">
                <Link :href="route('sb.admin.dashboard')" class="flex items-center gap-3 no-underline text-gray-800 text-xl font-semibold">
                    <i class="pi pi-sparkles text-2xl text-indigo-500"></i>
                    <span v-if="sidebarVisible" class="transition-opacity duration-300">Spraby Admin</span>
                </Link>
            </div>

            <!-- Sidebar Menu -->
            <div class="flex-1 overflow-y-auto p-2">
                <PanelMenu :model="menuItems" class="w-full border-none" />
            </div>
        </aside>

        <!-- Mobile Sidebar (PrimeVue Sidebar) -->
        <Sidebar
            v-model:visible="mobileSidebarVisible"
            :show-close-icon="true"
            class="w-80"
        >
            <template #header>
                <Link :href="route('sb.admin.dashboard')" class="flex items-center gap-3 no-underline text-gray-800 text-xl font-semibold">
                    <i class="pi pi-sparkles text-2xl text-indigo-500"></i>
                    <span>Spraby Admin</span>
                </Link>
            </template>

            <div class="mt-4">
                <PanelMenu :model="menuItems" class="w-full border-none" @click="mobileSidebarVisible = false" />
            </div>
        </Sidebar>

        <!-- Main Content Area -->
        <div
            :class="[
                'flex-1 flex flex-col transition-all duration-300',
                !isMobile && sidebarVisible ? 'md:ml-72' : !isMobile ? 'md:ml-20' : 'ml-0'
            ]"
        >
            <!-- Top Header -->
            <header class="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                <div class="flex items-center gap-2 md:gap-4 flex-1">
                    <Button
                        icon="pi pi-bars"
                        @click="toggleSidebar"
                        text
                        rounded
                        aria-label="Toggle Sidebar"
                        class="text-gray-600 hover:bg-gray-100"
                    />
                    <div class="flex-1 overflow-hidden">
                        <slot name="header" />
                    </div>
                </div>

                <div class="flex items-center gap-2 md:gap-4">
                    <div class="relative">
                        <Button
                            @click="toggleUserMenu"
                            text
                            class="flex items-center gap-2 p-2"
                        >
                            <Avatar
                                :label="user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'"
                                shape="circle"
                                size="normal"
                                class="bg-indigo-500 text-white"
                            />
                            <span class="font-medium text-gray-800 hidden lg:inline text-sm">
                                {{ user?.first_name || user?.email }}
                            </span>
                            <i class="pi pi-chevron-down text-xs hidden lg:inline"></i>
                        </Button>
                        <Menu ref="userMenuRef" :model="userMenuItems" popup />
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="flex-1 p-4 md:p-6 lg:p-8">
                <slot />
            </main>
        </div>
    </div>
</template>

