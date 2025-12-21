<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import Card from 'primevue/card';
</script>

<template>
    <Head title="Users Settings" />

    <AdminLayout>
        <template #header>
            <h1 class="text-2xl font-semibold text-app-primary">Users Settings</h1>
        </template>

        <Card>
            <template #content>
                <p class="text-app-secondary">Users settings page - Coming soon...</p>
            </template>
        </Card>
    </AdminLayout>
</template>
