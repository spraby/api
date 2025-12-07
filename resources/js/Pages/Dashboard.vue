<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const user = computed(() => page.props.auth.user);
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2
                class="text-xl font-semibold leading-tight text-gray-800"
            >
                Dashboard
            </h2>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div
                    class="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                >
                    <div class="p-6 text-gray-900">
                        <h3 class="text-lg font-semibold mb-4">Welcome, {{ user?.first_name || user?.email }}!</h3>

                        <div class="space-y-2">
                            <p><strong>Email:</strong> {{ user?.email }}</p>
                            <p><strong>Roles:</strong> {{ user?.roles?.join(', ') || 'No roles' }}</p>
                            <p><strong>Is Admin:</strong> {{ user?.is_admin ? 'Yes' : 'No' }}</p>
                            <p><strong>Is Manager:</strong> {{ user?.is_manager ? 'Yes' : 'No' }}</p>
                        </div>

                        <div class="mt-6 p-4 bg-gray-100 rounded">
                            <p class="text-sm text-gray-600">
                                Both Filament admin (<a href="/admin" class="text-blue-600 hover:underline">/admin</a>)
                                and Vue admin (<a href="/sb/admin/dashboard" class="text-blue-600 hover:underline">/sb/admin</a>)
                                are accessible to all roles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
