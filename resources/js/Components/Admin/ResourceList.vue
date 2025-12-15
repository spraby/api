<script setup lang="ts">
import { computed, watch, useSlots } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import ConfirmDialog from 'primevue/confirmdialog'
import Message from 'primevue/message'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Toolbar from 'primevue/toolbar'
import Avatar from 'primevue/avatar'

import {
    useResourceList,
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
    defaultActions,
    type ColumnConfig,
    type FilterConfig,
    type ActionConfig,
    type FetchFunction,
    type ActiveFilter
} from '@/composables/useResourceList'

// ============================================================================
// PROPS
// ============================================================================

export interface ResourceListProps<T = any> {
    columns: ColumnConfig[]
    filters?: FilterConfig[]
    actions?: (ActionConfig | 'view' | 'edit' | 'delete')[]
    fetchFunction: FetchFunction<T>
    title?: string
    dataKey?: string
    defaultPerPage?: number
    perPageOptions?: number[]
    stripedRows?: boolean
    showCreateButton?: boolean
    createButtonLabel?: string
    emptyMessage?: string
    loadingMessage?: string
    showTotalInfo?: boolean
    selectionMode?: 'single' | 'multiple' | null
    selection?: T | T[] | null
    paginatorTemplate?: string
    showRefreshButton?: boolean
    deleteConfirmMessage?: (row: T) => string
    deleteConfirmHeader?: string
    autoFetch?: boolean
    responsiveLayout?: 'scroll' | 'stack'
    size?: 'small' | 'normal' | 'large'
}

const props = withDefaults(defineProps<ResourceListProps>(), {
    filters: () => [],
    actions: () => ['view', 'edit', 'delete'],
    title: '',
    dataKey: 'id',
    defaultPerPage: 10,
    perPageOptions: () => [10, 20, 50],
    stripedRows: true,
    showCreateButton: true,
    createButtonLabel: 'Создать',
    emptyMessage: 'Нет данных',
    loadingMessage: 'Загрузка данных...',
    showTotalInfo: true,
    selectionMode: null,
    selection: null,
    paginatorTemplate: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
    showRefreshButton: true,
    deleteConfirmMessage: (row: any) => `Вы уверены, что хотите удалить этот элемент?`,
    deleteConfirmHeader: 'Подтверждение удаления',
    autoFetch: true,
    responsiveLayout: 'scroll',
    size: 'normal'
})

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
    create: []
    view: [row: any]
    edit: [row: any]
    delete: [row: any]
    action: [action: ActionConfig, row: any]
    'update:page': [page: number]
    'update:perPage': [perPage: number]
    'update:filters': [filters: Record<string, any>]
    'update:sort': [sort: { field: string | null; order: 'asc' | 'desc' | null }]
    'update:selection': [selection: any]
    'row-click': [event: { data: any; originalEvent: Event }]
}>()

// ============================================================================
// SLOTS
// ============================================================================

const slots = useSlots()

// ============================================================================
// COMPOSABLE
// ============================================================================

const resourceList = useResourceList({
    fetchFunction: props.fetchFunction,
    filters: props.filters,
    defaultPerPage: props.defaultPerPage,
    autoFetch: props.autoFetch
})

const {
    data,
    loading,
    error,
    pagination,
    sort,
    filterValues,
    first,
    totalRecords,
    activeFilters,
    hasActiveFilters,
    fetch,
    refresh,
    onPageChange,
    onSort,
    setFilter,
    removeFilter,
    clearFilters
} = resourceList

// ============================================================================
// CONFIRM SERVICE
// ============================================================================

const confirm = useConfirm()

// ============================================================================
// COMPUTED
// ============================================================================

const normalizedActions = computed<ActionConfig[]>(() => {
    return props.actions.map(action => {
        if (typeof action === 'string') {
            return defaultActions[action] || { type: action as any }
        }
        return action
    })
})

const visibleColumns = computed(() => {
    return props.columns.filter(col => !col.hidden)
})

const sortField = computed({
    get: () => sort.field,
    set: (value) => { sort.field = value }
})

const sortOrder = computed({
    get: () => {
        if (sort.order === 'asc') return 1
        if (sort.order === 'desc') return -1
        return 0
    },
    set: (value) => {
        sort.order = value === 1 ? 'asc' : value === -1 ? 'desc' : null
    }
})

// ============================================================================
// WATCHERS
// ============================================================================

watch(() => pagination.page, (newPage) => {
    emit('update:page', newPage)
})

watch(() => pagination.perPage, (newPerPage) => {
    emit('update:perPage', newPerPage)
})

watch(filterValues, (newFilters) => {
    emit('update:filters', { ...newFilters })
}, { deep: true })

watch([() => sort.field, () => sort.order], ([field, order]) => {
    emit('update:sort', { field, order })
})

// ============================================================================
// METHODS
// ============================================================================

function handlePageChange(event: { page: number; rows: number }): void {
    onPageChange(event)
}

function handleSort(event: { sortField: string; sortOrder: number }): void {
    onSort(event)
}

function handleFilterChange(key: string, value: any): void {
    setFilter(key, value)
}

function handleRemoveFilter(filter: ActiveFilter): void {
    removeFilter(filter.key)
}

function handleCreate(): void {
    emit('create')
}

function handleAction(action: ActionConfig, row: any): void {
    if (action.type === 'view') {
        emit('view', row)
    } else if (action.type === 'edit') {
        emit('edit', row)
    } else if (action.type === 'delete') {
        confirmDelete(row)
    } else if (action.type === 'custom' && action.handler) {
        action.handler(row)
    }
    emit('action', action, row)
}

function confirmDelete(row: any): void {
    confirm.require({
        message: props.deleteConfirmMessage(row),
        header: props.deleteConfirmHeader,
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Отмена',
        acceptLabel: 'Удалить',
        rejectProps: {
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            severity: 'danger'
        },
        accept: () => {
            emit('delete', row)
        }
    })
}

function handleRowClick(event: { data: any; originalEvent: Event }): void {
    emit('row-click', event)
}

function handleSelectionChange(value: any): void {
    emit('update:selection', value)
}

function formatCellValue(value: any, column: ColumnConfig, row: any): string {
    if (column.formatter) {
        return column.formatter(value, row)
    }
    if (value === null || value === undefined) {
        return '—'
    }
    switch (column.type) {
        case 'date':
            return formatDate(value, column.dateFormat)
        case 'datetime':
            return formatDateTime(value, column.dateFormat)
        case 'currency':
            return formatCurrency(value, column.currencyOptions?.currency, column.currencyOptions?.locale)
        case 'number':
            return formatNumber(value)
        case 'boolean':
            return value ? 'Да' : 'Нет'
        default:
            return String(value)
    }
}

function getStatusSeverity(value: any, column: ColumnConfig): string | undefined {
    if (column.type === 'status' && column.statusMap) {
        return column.statusMap[value]?.severity
    }
    return undefined
}

function getStatusLabel(value: any, column: ColumnConfig): string {
    if (column.type === 'status' && column.statusMap) {
        return column.statusMap[value]?.label || String(value)
    }
    return String(value)
}

function isActionVisible(action: ActionConfig, row: any): boolean {
    return action.visible ? action.visible(row) : true
}

function isActionDisabled(action: ActionConfig, row: any): boolean {
    return action.disabled ? action.disabled(row) : false
}

// ============================================================================
// EXPOSE
// ============================================================================

defineExpose({
    fetch,
    refresh,
    clearFilters,
    setFilter,
    removeFilter,
    data,
    loading,
    pagination,
    sort,
    filterValues,
    activeFilters
})
</script>

<template>
    <Card class="shadow-none border border-surface-200 dark:border-surface-700">
        <!-- Header with Toolbar -->
        <template #header>
            <Toolbar class="border-0 bg-transparent px-4 pt-4">
                <template #start>
                    <h2 v-if="title" class="text-xl font-semibold text-surface-800 dark:text-surface-100 m-0">
                        {{ title }}
                    </h2>
                    <slot name="header-start" />
                </template>
                <template #end>
                    <div class="flex items-center gap-2">
                        <Button
                            v-if="showRefreshButton"
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            rounded
                            :loading="loading"
                            v-tooltip.top="'Обновить'"
                            @click="refresh"
                        />
                        <slot name="header-actions" />
                        <Button
                            v-if="showCreateButton"
                            :label="createButtonLabel"
                            icon="pi pi-plus"
                            @click="handleCreate"
                        />
                    </div>
                </template>
            </Toolbar>
        </template>

        <template #content>
            <!-- Filters Section -->
            <div v-if="props.filters.length > 0 || $slots.filters" class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div class="flex flex-wrap items-center gap-3">
                    <slot name="filters" :filter-values="filterValues" :set-filter="handleFilterChange">
                        <template v-for="filter in props.filters" :key="filter.key">
                            <!-- Text Filter with Icon -->
                            <IconField v-if="filter.type === 'text'">
                                <InputIcon class="pi pi-search" />
                                <InputText
                                    :model-value="filterValues[filter.key]"
                                    :placeholder="filter.placeholder || filter.label"
                                    :style="{ width: filter.width || '220px' }"
                                    @update:model-value="handleFilterChange(filter.key, $event)"
                                    @keydown.enter="fetch"
                                />
                            </IconField>

                            <!-- Dropdown Filter (Select in PrimeVue 4) -->
                            <Select
                                v-else-if="filter.type === 'dropdown'"
                                :model-value="filterValues[filter.key]"
                                :options="filter.options"
                                option-label="label"
                                option-value="value"
                                :placeholder="filter.placeholder || filter.label"
                                :style="{ width: filter.width || '180px' }"
                                show-clear
                                @update:model-value="handleFilterChange(filter.key, $event)"
                            />

                            <!-- MultiSelect Filter -->
                            <MultiSelect
                                v-else-if="filter.type === 'multiselect'"
                                :model-value="filterValues[filter.key]"
                                :options="filter.options"
                                option-label="label"
                                option-value="value"
                                :placeholder="filter.placeholder || filter.label"
                                :style="{ width: filter.width || '220px' }"
                                :max-selected-labels="2"
                                @update:model-value="handleFilterChange(filter.key, $event)"
                            />

                            <!-- Date Filter (DatePicker in PrimeVue 4) -->
                            <DatePicker
                                v-else-if="filter.type === 'date'"
                                :model-value="filterValues[filter.key]"
                                :placeholder="filter.placeholder || filter.label"
                                :style="{ width: filter.width || '160px' }"
                                date-format="dd.mm.yy"
                                show-icon
                                show-button-bar
                                @update:model-value="handleFilterChange(filter.key, $event)"
                            />

                            <!-- Date Range Filter -->
                            <DatePicker
                                v-else-if="filter.type === 'daterange'"
                                :model-value="filterValues[filter.key]"
                                :placeholder="filter.placeholder || filter.label"
                                :style="{ width: filter.width || '260px' }"
                                date-format="dd.mm.yy"
                                selection-mode="range"
                                show-icon
                                show-button-bar
                                @update:model-value="handleFilterChange(filter.key, $event)"
                            />

                            <!-- Number Filter -->
                            <InputNumber
                                v-else-if="filter.type === 'number'"
                                :model-value="filterValues[filter.key]"
                                :placeholder="filter.placeholder || filter.label"
                                :style="{ width: filter.width || '140px' }"
                                :min="filter.min"
                                :max="filter.max"
                                :step="filter.step"
                                show-buttons
                                @update:model-value="handleFilterChange(filter.key, $event)"
                            />

                            <!-- Boolean Filter -->
                            <div v-else-if="filter.type === 'boolean'" class="flex items-center gap-2">
                                <Checkbox
                                    :model-value="filterValues[filter.key]"
                                    :input-id="`filter-${filter.key}`"
                                    binary
                                    @update:model-value="handleFilterChange(filter.key, $event)"
                                />
                                <label
                                    :for="`filter-${filter.key}`"
                                    class="cursor-pointer text-surface-700 dark:text-surface-200"
                                >
                                    {{ filter.label }}
                                </label>
                            </div>
                        </template>
                    </slot>

                    <!-- Clear Filters Button -->
                    <Button
                        v-if="hasActiveFilters"
                        label="Сбросить"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="clearFilters"
                    />
                </div>

                <!-- Total Info -->
                <div v-if="showTotalInfo" class="text-sm text-surface-500 dark:text-surface-400">
                    Всего: <span class="font-semibold text-surface-700 dark:text-surface-200">{{ totalRecords }}</span> записей
                </div>
            </div>

            <!-- Active Filters Tags -->
            <div v-if="activeFilters.length > 0" class="flex flex-wrap items-center gap-2 mb-4">
                <span class="text-sm text-surface-500 dark:text-surface-400">Фильтры:</span>
                <Chip
                    v-for="filter in activeFilters"
                    :key="filter.key"
                    :label="`${filter.label}: ${filter.displayValue}`"
                    removable
                    class="text-sm"
                    @remove="handleRemoveFilter(filter)"
                />
            </div>

            <!-- Error Message -->
            <Message v-if="error" severity="error" :closable="false" class="mb-4">
                <template #messageicon>
                    <i class="pi pi-exclamation-circle mr-2" />
                </template>
                {{ error }}
                <Button
                    label="Повторить"
                    icon="pi pi-refresh"
                    severity="secondary"
                    text
                    size="small"
                    class="ml-4"
                    @click="fetch"
                />
            </Message>

            <!-- Data Table -->
            <DataTable
                :value="data"
                :loading="loading"
                :data-key="dataKey"
                :striped-rows="stripedRows"
                :size="size"
                :selection="selection"
                :selection-mode="selectionMode"
                :sort-field="sortField"
                :sort-order="sortOrder"
                scrollable
                scroll-height="flex"
                @sort="handleSort"
                @row-click="handleRowClick"
                @update:selection="handleSelectionChange"
            >
                <!-- Empty State -->
                <template #empty>
                    <slot name="empty">
                        <div class="flex flex-col items-center justify-center py-12 text-surface-400">
                            <i class="pi pi-inbox text-5xl mb-4 opacity-50" />
                            <p class="text-base m-0">{{ emptyMessage }}</p>
                        </div>
                    </slot>
                </template>

                <!-- Loading State -->
                <template #loading>
                    <slot name="loading">
                        <div class="flex flex-col items-center justify-center py-12 text-surface-400">
                            <i class="pi pi-spin pi-spinner text-5xl mb-4" />
                            <p class="text-base m-0">{{ loadingMessage }}</p>
                        </div>
                    </slot>
                </template>

                <!-- Selection Column -->
                <Column
                    v-if="selectionMode"
                    selection-mode="multiple"
                    style="width: 3rem"
                    :exportable="false"
                />

                <!-- Dynamic Columns -->
                <Column
                    v-for="column in visibleColumns"
                    :key="column.field"
                    :field="column.field"
                    :header="column.header"
                    :sortable="column.sortable"
                    :style="{ width: column.width, minWidth: column.minWidth }"
                    :frozen="column.frozen"
                    :class="column.className"
                >
                    <template #body="{ data: row }">
                        <!-- Custom slot -->
                        <slot
                            v-if="column.slotName && $slots[column.slotName]"
                            :name="column.slotName"
                            :data="row"
                            :column="column"
                            :value="row[column.field]"
                        />

                        <!-- Status type with Tag -->
                        <Tag
                            v-else-if="column.type === 'status'"
                            :value="getStatusLabel(row[column.field], column)"
                            :severity="getStatusSeverity(row[column.field], column)"
                        />

                        <!-- Image type with Avatar -->
                        <Avatar
                            v-else-if="column.type === 'image' && row[column.field]"
                            :image="row[column.field]"
                            shape="square"
                            size="large"
                        />
                        <span v-else-if="column.type === 'image'" class="text-surface-400">—</span>

                        <!-- Link type -->
                        <a
                            v-else-if="column.type === 'link' && row[column.field]"
                            :href="row[column.field]"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-primary hover:underline"
                        >
                            {{ row[column.field] }}
                        </a>
                        <span v-else-if="column.type === 'link'" class="text-surface-400">—</span>

                        <!-- Boolean type -->
                        <i
                            v-else-if="column.type === 'boolean'"
                            :class="[
                                row[column.field] ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'
                            ]"
                        />

                        <!-- Default formatted value -->
                        <span v-else>{{ formatCellValue(row[column.field], column, row) }}</span>
                    </template>
                </Column>

                <!-- Actions Column -->
                <Column
                    v-if="actions.length > 0"
                    header="Действия"
                    :exportable="false"
                    :style="{ width: `${normalizedActions.length * 44 + 16}px` }"
                    frozen
                    align-frozen="right"
                >
                    <template #body="{ data: row }">
                        <div class="flex items-center gap-1">
                            <template v-for="action in normalizedActions" :key="action.type">
                                <Button
                                    v-if="isActionVisible(action, row)"
                                    :icon="action.icon"
                                    :severity="action.severity"
                                    :disabled="isActionDisabled(action, row)"
                                    text
                                    rounded
                                    size="small"
                                    v-tooltip.top="action.tooltip"
                                    @click="handleAction(action, row)"
                                />
                            </template>
                            <slot name="row-actions" :row="row" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Paginator -->
            <Paginator
                v-if="totalRecords > 0"
                :first="first"
                :rows="pagination.perPage"
                :total-records="totalRecords"
                :rows-per-page-options="perPageOptions"
                :template="paginatorTemplate"
                class="border-t border-surface-200 dark:border-surface-700 pt-4 mt-4"
                @page="handlePageChange"
            >
                <template #start>
                    <span class="text-sm text-surface-500 dark:text-surface-400">
                        Показано {{ pagination.from || 0 }}–{{ pagination.to || 0 }} из {{ totalRecords }}
                    </span>
                </template>
            </Paginator>
        </template>

        <!-- Footer Slot -->
        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </Card>

    <!-- Confirm Dialog -->
    <ConfirmDialog />
</template>
