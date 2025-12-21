<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import Card from 'primevue/card';
import Button from 'primevue/button';
</script>

<template>
    <Head title="Dashboard" />

    <AdminLayout>
        <template #header>
            <h1 class="text-xl md:text-2xl font-semibold text-app-primary truncate">Dashboard</h1>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <!-- Welcome Card - Full width on mobile -->
            <Card class="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <template #title>
                    <span class="text-lg md:text-xl">Welcome to Admin Panel</span>
                </template>
                <template #content>
                    <p class="text-sm md:text-base text-app-secondary">
                        This is your admin dashboard. Use the sidebar to navigate between different sections.
                    </p>
                </template>
            </Card>

            <!-- Stats Cards -->
            <Card class="hover:shadow-lg transition-shadow">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-box text-blue-500 text-xl md:text-2xl"></i>
                        <span class="text-base md:text-lg">Products</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-2xl md:text-3xl font-bold mb-2 md:mb-3">0</p>
                    <Button label="View Products" icon="pi pi-arrow-right" link size="small" class="text-sm" />
                </template>
            </Card>

            <Card class="hover:shadow-lg transition-shadow">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-shopping-cart text-green-500 text-xl md:text-2xl"></i>
                        <span class="text-base md:text-lg">Orders</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-2xl md:text-3xl font-bold mb-2 md:mb-3">0</p>
                    <Button label="View Orders" icon="pi pi-arrow-right" link size="small" class="text-sm" />
                </template>
            </Card>

            <Card class="hover:shadow-lg transition-shadow">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-users text-purple-500 text-xl md:text-2xl"></i>
                        <span class="text-base md:text-lg">Customers</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-2xl md:text-3xl font-bold mb-2 md:mb-3">0</p>
                    <Button label="View Customers" icon="pi pi-arrow-right" link size="small" class="text-sm" />
                </template>
            </Card>

            <Card class="hover:shadow-lg transition-shadow">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-chart-line text-orange-500 text-xl md:text-2xl"></i>
                        <span class="text-base md:text-lg">Revenue</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-2xl md:text-3xl font-bold mb-2 md:mb-3">$0</p>
                    <Button label="View Reports" icon="pi pi-arrow-right" link size="small" class="text-sm" />
                </template>
            </Card>
        </div>
    </AdminLayout>
</template>
