<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import AdminLayout from '@/Layouts/AdminLayout.vue'
import ResourceList from '@/Components/Admin/ResourceList.vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import type {
    ColumnConfig,
    FilterConfig,
    ActionConfig,
    BulkActionConfig,
    LaravelPaginatorResponse,
    QueryParams
} from '@/composables/useResourceList'

// ============================================================================
// TYPES
// ============================================================================

interface Product {
    id: number
    brand_id: number
    category_id: number | null
    title: string
    description: string | null
    enabled: boolean
    price: string
    final_price: string
    discount: number
    created_at: string
    updated_at: string
    brand?: { id: number; name: string }
    category?: { id: number; name: string } | null
    variants_count: number
    images_count: number
    orders_count: number
}

interface Category {
    id: number
    name: string
}

// ============================================================================
// TOAST
// ============================================================================

const toast = useToast()

// ============================================================================
// CATEGORIES
// ============================================================================

const categories = ref<Category[]>([])
const categoriesLoading = ref(false)

// Load categories for filter
async function loadCategories() {
    if (categories.value.length > 0) return

    categoriesLoading.value = true
    try {
        const response = await fetch('/sb/admin/api/categories', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })

        if (response.ok) {
            const data = await response.json()
            categories.value = data.data || []
        }
    } catch (error) {
        console.error('Failed to load categories:', error)
    } finally {
        categoriesLoading.value = false
    }
}

// Load categories on mount
loadCategories()

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
        field: 'title',
        header: 'Название',
        sortable: true,
        minWidth: '250px'
    },
    {
        field: 'category.name',
        header: 'Категория',
        sortable: false,
        width: '150px',
        formatter: (value, row: Product) => row.category?.name || '—'
    },
    {
        field: 'price',
        header: 'Цена',
        sortable: true,
        width: '120px',
        type: 'custom',
        formatter: (value) => `$${value}`
    },
    {
        field: 'final_price',
        header: 'Фин. цена',
        sortable: true,
        width: '120px',
        type: 'custom',
        formatter: (value) => `$${value}`
    },
    {
        field: 'discount',
        header: 'Скидка',
        width: '100px',
        type: 'custom',
        formatter: (value: number) => value > 0 ? `${value}%` : '—'
    },
    {
        field: 'enabled',
        header: 'Статус',
        width: '100px',
        type: 'custom'
    },
    {
        field: 'variants_count',
        header: 'Варианты',
        sortable: true,
        width: '100px',
        type: 'number'
    },
    {
        field: 'images_count',
        header: 'Фото',
        sortable: true,
        width: '100px',
        type: 'number'
    },
    {
        field: 'orders_count',
        header: 'Заказы',
        sortable: true,
        width: '100px',
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
    },
    {
        key: 'category_id',
        label: 'Категория',
        type: 'multiselect',
        placeholder: 'Все категории',
        width: '200px',
        options: computed(() => categories.value.map(c => ({ label: c.name, value: c.id })))
    },
    {
        key: 'enabled',
        label: 'Статус',
        type: 'multiselect',
        placeholder: 'Все',
        width: '150px',
        options: [
            { label: 'Активные', value: 'true' },
            { label: 'Неактивные', value: 'false' }
        ]
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
        disabled: (row: Product) => row.orders_count > 0
    }
]

// ============================================================================
// BULK ACTIONS CONFIGURATION
// ============================================================================

const bulkActions: BulkActionConfig[] = [
    {
        type: 'enable',
        label: 'Активировать',
        icon: 'pi pi-check',
        severity: 'success',
        handler: async (items: Product[]) => {
            await handleBulkEnable(items, true)
        }
    },
    {
        type: 'disable',
        label: 'Деактивировать',
        icon: 'pi pi-times',
        severity: 'warning',
        handler: async (items: Product[]) => {
            await handleBulkEnable(items, false)
        }
    },
    {
        type: 'delete',
        label: 'Удалить',
        icon: 'pi pi-trash',
        severity: 'danger',
        requireConfirm: true,
        confirmMessage: (items: Product[]) =>
            `Вы уверены, что хотите удалить ${items.length} продукта(ов)?`,
        confirmHeader: 'Массовое удаление',
        disabled: (items: Product[]) => items.some(item => item.orders_count > 0),
        handler: async (items: Product[]) => {
            await handleBulkDelete(items)
        }
    }
]

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchProducts(params: QueryParams): Promise<LaravelPaginatorResponse<Product>> {
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

    const response = await fetch(`/sb/admin/api/products?${queryParams.toString()}`, {
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
    title: string
    description: string
    category_id: number | null
    price: number | null
    final_price: number | null
    enabled: boolean
}>({
    id: null,
    title: '',
    description: '',
    category_id: null,
    price: null,
    final_price: null,
    enabled: true
})

const formErrors = ref<Record<string, string>>({})

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleCreate() {
    formData.value = {
        id: null,
        title: '',
        description: '',
        category_id: null,
        price: null,
        final_price: null,
        enabled: true
    }
    formErrors.value = {}
    dialogMode.value = 'create'
    dialogVisible.value = true
}

function handleEdit(product: Product) {
    formData.value = {
        id: product.id,
        title: product.title,
        description: product.description || '',
        category_id: product.category_id,
        price: parseFloat(product.price),
        final_price: parseFloat(product.final_price),
        enabled: product.enabled
    }
    formErrors.value = {}
    dialogMode.value = 'edit'
    dialogVisible.value = true
}

async function handleDelete(product: Product) {
    try {
        const response = await fetch(`/sb/admin/api/products/${product.id}`, {
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
            throw new Error(data.message || 'Failed to delete product')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: `Продукт "${product.title}" удален`,
            life: 3000
        })

        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось удалить продукт',
            life: 5000
        })
    }
}

async function handleBulkEnable(products: Product[], enabled: boolean) {
    try {
        const ids = products.map(p => p.id)
        const response = await fetch('/sb/admin/api/products/bulk-update', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                ids,
                enabled
            })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to update products')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: `${products.length} продукта(ов) ${enabled ? 'активировано' : 'деактивировано'}`,
            life: 3000
        })

        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось обновить продукты',
            life: 5000
        })
    }
}

async function handleBulkDelete(products: Product[]) {
    try {
        const ids = products.map(p => p.id)
        const response = await fetch('/sb/admin/api/products/bulk-delete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({ ids })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to delete products')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: `${products.length} продукта(ов) удалено`,
            life: 3000
        })

        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось удалить продукты',
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
            ? `/sb/admin/api/products/${formData.value.id}`
            : '/sb/admin/api/products'

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
                title: formData.value.title,
                description: formData.value.description || null,
                category_id: formData.value.category_id || null,
                price: formData.value.price,
                final_price: formData.value.final_price,
                enabled: formData.value.enabled
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
            throw new Error(data.message || 'Failed to save product')
        }

        toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: isEdit ? 'Продукт обновлен' : 'Продукт создан',
            life: 3000
        })

        dialogVisible.value = false
        resourceListRef.value?.refresh()
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.message || 'Не удалось сохранить продукт',
            life: 5000
        })
    } finally {
        dialogLoading.value = false
    }
}

function handleDialogHide() {
    formData.value = {
        id: null,
        title: '',
        description: '',
        category_id: null,
        price: null,
        final_price: null,
        enabled: true
    }
    formErrors.value = {}
}

// Custom cell renderer for status
function getStatusSeverity(enabled: boolean): 'success' | 'danger' {
    return enabled ? 'success' : 'danger'
}

function getStatusLabel(enabled: boolean): string {
    return enabled ? 'Активен' : 'Неактивен'
}
</script>

<template>
    <Head title="Продукты" />

    <AdminLayout>
        <template #header>
            <h1 class="text-2xl font-semibold text-app-primary">Продукты</h1>
        </template>

        <Toast />

        <ResourceList
            ref="resourceListRef"
            :columns="columns"
            :filters="filters"
            :actions="actions"
            :bulk-actions="bulkActions"
            selection-mode="multiple"
            :fetch-function="fetchProducts"
            :default-per-page="20"
            :show-create-button="true"
            create-button-label="Добавить продукт"
            empty-message="Продукты не найдены"
            :delete-confirm-message="(row) => `Вы уверены, что хотите удалить продукт «${row.title}»?`"
            delete-confirm-header="Удаление продукта"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
        >
            <!-- Custom cell template for status -->
            <template #cell-enabled="{ data }">
                <Tag
                    :value="getStatusLabel(data.enabled)"
                    :severity="getStatusSeverity(data.enabled)"
                />
            </template>

            <!-- Custom cell template for discount -->
            <template #cell-discount="{ data }">
                <Tag
                    v-if="data.discount > 0"
                    :value="`-${data.discount}%`"
                    severity="success"
                />
                <span v-else class="text-surface-500">—</span>
            </template>
        </ResourceList>

        <!-- Create/Edit Dialog -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="dialogMode === 'create' ? 'Новый продукт' : 'Редактирование продукта'"
            :style="{ width: '600px' }"
            :modal="true"
            :closable="!dialogLoading"
            :close-on-escape="!dialogLoading"
            @hide="handleDialogHide"
        >
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
                <!-- Title -->
                <div class="flex flex-col gap-2">
                    <label for="product-title" class="font-medium text-app-primary">
                        Название <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        id="product-title"
                        v-model="formData.title"
                        :invalid="!!formErrors.title"
                        placeholder="Введите название продукта"
                        class="w-full"
                    />
                    <small v-if="formErrors.title" class="text-red-500">
                        {{ formErrors.title }}
                    </small>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label for="product-description" class="font-medium text-app-primary">
                        Описание
                    </label>
                    <Textarea
                        id="product-description"
                        v-model="formData.description"
                        :invalid="!!formErrors.description"
                        placeholder="Введите описание продукта"
                        rows="4"
                        class="w-full"
                    />
                    <small v-if="formErrors.description" class="text-red-500">
                        {{ formErrors.description }}
                    </small>
                </div>

                <!-- Category -->
                <div class="flex flex-col gap-2">
                    <label for="product-category" class="font-medium text-app-primary">
                        Категория
                    </label>
                    <Select
                        id="product-category"
                        v-model="formData.category_id"
                        :options="categories"
                        option-label="name"
                        option-value="id"
                        :invalid="!!formErrors.category_id"
                        placeholder="Выберите категорию"
                        :loading="categoriesLoading"
                        class="w-full"
                        showClear
                    />
                    <small v-if="formErrors.category_id" class="text-red-500">
                        {{ formErrors.category_id }}
                    </small>
                </div>

                <!-- Price & Final Price -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="product-price" class="font-medium text-app-primary">
                            Цена <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="product-price"
                            v-model="formData.price"
                            :invalid="!!formErrors.price"
                            placeholder="0.00"
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                            :min="0"
                            :minFractionDigits="2"
                            class="w-full"
                        />
                        <small v-if="formErrors.price" class="text-red-500">
                            {{ formErrors.price }}
                        </small>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="product-final-price" class="font-medium text-app-primary">
                            Финальная цена <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="product-final-price"
                            v-model="formData.final_price"
                            :invalid="!!formErrors.final_price"
                            placeholder="0.00"
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                            :min="0"
                            :minFractionDigits="2"
                            class="w-full"
                        />
                        <small v-if="formErrors.final_price" class="text-red-500">
                            {{ formErrors.final_price }}
                        </small>
                    </div>
                </div>

                <!-- Enabled -->
                <div class="flex items-center gap-3">
                    <label for="product-enabled" class="font-medium text-app-primary">
                        Активен
                    </label>
                    <ToggleSwitch
                        id="product-enabled"
                        v-model="formData.enabled"
                    />
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
