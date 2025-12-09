<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import Card from 'primevue/card';
</script>

<template>
    <Head title="Pending Orders" />

    <AdminLayout>
        <template #header>
            <h1 class="text-2xl font-semibold text-gray-800">Pending Orders</h1>
        </template>

        <Card>
            <template #content>
                <p class="text-gray-600">Pending orders page - Coming soon...</p>
            </template>
        </Card>
    </AdminLayout>
</template>
