<script setup lang="ts">
import { ref } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AdminLayout from '@/Layouts/AdminLayout.vue'
import ResourceList from '@/Components/Admin/ResourceList.vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import type {
    ColumnConfig,
    FilterConfig,
    ActionConfig,
    LaravelPaginatorResponse,
    QueryParams
} from '@/composables/useResourceList'

// ============================================================================
// TYPES
// ============================================================================

interface Brand {
    id: number
    name: string
    description: string | null
    user_id: number | null
    products_count: number
    categories_count: number
    orders_count: number
    created_at: string
    updated_at: string
}

// ============================================================================
// TOAST
// ============================================================================

const toast = useToast()

// ============================================================================
// COLUMN CONFIGURATION
// ============================================================================

const columns: ColumnConfig[] = [
    {
        field: 'id',
        header: 'ID',
        sortable: true,
        width: '80px',
        type: 'number'
    },
    {
        field: 'name',
        header: 'Название',
        sortable: true,
        minWidth: '200px'
    },
    {
        field: 'description',
        header: 'Описание',
        minWidth: '250px',
        formatter: (value) => value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '—'
    },
    {
        field: 'products_count',
        header: 'Товаров',
        sortable: true,
        width: '120px',
        type: 'number'
    },
    {
        field: 'orders_count',
        header: 'Заказов',
        sortable: true,
        width: '120px',
        type: 'number'
    },
    {
        field: 'created_at',
        header: 'Создан',
        sortable: true,
        width: '140px',
        type: 'date'
    }
]

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

const filters: FilterConfig[] = [
    {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Поиск по названию...',
        width: '280px'
    }
]

// ============================================================================
// ACTIONS CONFIGURATION
// ============================================================================

const actions: ActionConfig[] = [
    {
        type: 'edit',
        icon: 'pi pi-pencil',
        severity: 'warning',
        tooltip: 'Редактировать'
    },
    {
        type: 'delete',
        icon: 'pi pi-trash',
        severity: 'danger',
        tooltip: 'Удалить',
        disabled: (row: Brand) => row.products_count > 0
    }
]

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchBrands(params: QueryParams): Promise<LaravelPaginatorResponse<Brand>> {
    const queryParams = new URLSearchParams()

    queryParams.set('page', params.page.toString())
    queryParams.set('per_page', params.per_page.toString())

    // Filters
    for (const [key, value] of Object.entries(params.filters)) {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.set(key, String(value))
        }
    }

    // Sorting
    if (params.sort) {
        queryParams.set('sort_by', params.sort.field)
        queryParams.set('sort_order', params.sort.order)
    }

    const response = await fetch(`/sb/admin/api/brands?${queryParams.toString()}`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    })

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
    }

    return response.json()
}

// ============================================================================
// DIALOG STATE
// ============================================================================

const resourceListRef = ref<InstanceType<typeof ResourceList> | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogLoading = ref(false)

const formData = ref<{
    id: number | null
    name: string
    description: string
}>({
    id: null,
    name: '',
    description: ''
})

const formErrors = ref<Record<string, string>>({})

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleCreate() {
    formData.value = { id: null, name: '', description: '' }
    formErrors.value = {}
    dialogMode.value = 'create'
    dialogVisible.value = true
}

function handleEdit(brand: Brand) {
    formData.value = {
        id: brand.id,
        name: brand.name,
        description: brand.description || ''
    }
    formErrors.value = {}
    dialogMode.value = 'edit'
    dialogVisible.value = true
}

async function handleDelete(brand: Brand) {
    try {
        const response = await fetch(`/sb/admin/api/brands/${brand.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            credentials: 'same-origin'
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to delete brand')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: `Бренд "${brand.name}" удален`,
            life: 3000
        })

        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось удалить бренд',
            life: 5000
        })
    }
}

async function handleSubmit() {
    dialogLoading.value = true
    formErrors.value = {}

    try {
        const isEdit = dialogMode.value === 'edit'
        const url = isEdit
            ? `/sb/admin/api/brands/${formData.value.id}`
            : '/sb/admin/api/brands'

        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                name: formData.value.name,
                description: formData.value.description || null
            })
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 422 && data.errors) {
                formErrors.value = Object.fromEntries(
                    Object.entries(data.errors).map(([key, value]) => [key, (value as string[])[0]])
                )
                return
            }
            throw new Error(data.message || 'Failed to save brand')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: isEdit ? 'Бренд обновлен' : 'Бренд создан',
            life: 3000
        })

        dialogVisible.value = false
        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось сохранить бренд',
            life: 5000
        })
    } finally {
        dialogLoading.value = false
    }
}

function handleDialogHide() {
    formData.value = { id: null, name: '', description: '' }
    formErrors.value = {}
}
</script>

<template>
    <Head title="Бренды" />

    <AdminLayout>
        <template #header>
            <h1 class="text-2xl font-semibold text-slate-800">Бренды</h1>
        </template>

        <Toast />

        <ResourceList
            ref="resourceListRef"
            :columns="columns"
            :filters="filters"
            :actions="actions"
            :fetch-function="fetchBrands"
            :default-per-page="20"
            :show-create-button="true"
            create-button-label="Добавить бренд"
            empty-message="Бренды не найдены"
            :delete-confirm-message="(row) => `Вы уверены, что хотите удалить бренд «${row.name}»?`"
            delete-confirm-header="Удаление бренда"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
        />

        <!-- Create/Edit Dialog -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="dialogMode === 'create' ? 'Новый бренд' : 'Редактирование бренда'"
            :style="{ width: '500px' }"
            :modal="true"
            :closable="!dialogLoading"
            :close-on-escape="!dialogLoading"
            @hide="handleDialogHide"
        >
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
                <!-- Name -->
                <div class="flex flex-col gap-2">
                    <label for="brand-name" class="font-medium text-slate-700">
                        Название <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        id="brand-name"
                        v-model="formData.name"
                        :invalid="!!formErrors.name"
                        placeholder="Введите название бренда"
                        class="w-full"
                    />
                    <small v-if="formErrors.name" class="text-red-500">
                        {{ formErrors.name }}
                    </small>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label for="brand-description" class="font-medium text-slate-700">
                        Описание
                    </label>
                    <Textarea
                        id="brand-description"
                        v-model="formData.description"
                        :invalid="!!formErrors.description"
                        placeholder="Введите описание бренда"
                        rows="4"
                        class="w-full"
                    />
                    <small v-if="formErrors.description" class="text-red-500">
                        {{ formErrors.description }}
                    </small>
                </div>
            </form>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button
                        label="Отмена"
                        severity="secondary"
                        outlined
                        :disabled="dialogLoading"
                        @click="dialogVisible = false"
                    />
                    <Button
                        :label="dialogMode === 'create' ? 'Создать' : 'Сохранить'"
                        :loading="dialogLoading"
                        @click="handleSubmit"
                    />
                </div>
            </template>
        </Dialog>
    </AdminLayout>
</template>
