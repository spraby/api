import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Column type definitions for DataTable
 */
export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'status'
  | 'currency'
  | 'image'
  | 'link'
  | 'custom'

/**
 * Column configuration for DataTable
 */
export interface ColumnConfig {
  field: string
  header: string
  sortable?: boolean
  type?: ColumnType
  width?: string
  minWidth?: string
  frozen?: boolean
  hidden?: boolean
  /** Custom formatter function */
  formatter?: (value: any, row: any) => string
  /** Status map for 'status' type columns */
  statusMap?: Record<string, { label: string; severity: string }>
  /** Date format for 'date' and 'datetime' columns */
  dateFormat?: Intl.DateTimeFormatOptions
  /** Currency options for 'currency' type */
  currencyOptions?: { currency: string; locale: string }
  /** Custom CSS class for the column */
  className?: string
  /** Slot name for custom rendering */
  slotName?: string
}

/**
 * Filter type definitions
 */
export type FilterType =
  | 'text'
  | 'dropdown'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'number'
  | 'boolean'

/**
 * Filter option for dropdown/multiselect filters
 */
export interface FilterOption {
  label: string
  value: string | number | boolean | null
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  key: string
  label: string
  type: FilterType
  placeholder?: string
  options?: FilterOption[]
  /** For date filters */
  dateFormat?: string
  /** For number filters */
  min?: number
  max?: number
  step?: number
  /** Default value */
  defaultValue?: any
  /** Width of the filter input */
  width?: string
}

/**
 * Active filter value with metadata for tag display
 */
export interface ActiveFilter {
  key: string
  label: string
  value: any
  displayValue: string
}

/**
 * Row action types
 */
export type ActionType = 'view' | 'edit' | 'delete' | 'custom'

/**
 * Row action configuration
 */
export interface ActionConfig {
  type: ActionType
  label?: string
  icon?: string
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'
  tooltip?: string
  /** Condition function to show/hide action */
  visible?: (row: any) => boolean
  /** Condition function to enable/disable action */
  disabled?: (row: any) => boolean
  /** Handler for custom actions */
  handler?: (row: any) => void
}

/**
 * Bulk action configuration
 */
export interface BulkActionConfig {
  type: string
  label: string
  icon?: string
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'
  /** Require confirmation before executing */
  requireConfirm?: boolean
  /** Confirmation message (can be a function that receives selected items) */
  confirmMessage?: string | ((selectedItems: any[]) => string)
  /** Confirmation header */
  confirmHeader?: string
  /** Condition function to show/hide bulk action based on selected items */
  visible?: (selectedItems: any[]) => boolean
  /** Condition function to enable/disable bulk action based on selected items */
  disabled?: (selectedItems: any[]) => boolean
  /** Handler for bulk action */
  handler?: (selectedItems: any[]) => void | Promise<void>
}

/**
 * Sort state
 */
export interface SortState {
  field: string | null
  order: 'asc' | 'desc' | null
}

/**
 * Laravel paginator response format
 */
export interface LaravelPaginatorResponse<T = any> {
  current_page: number
  data: T[]
  first_page_url?: string
  from: number | null
  last_page: number
  last_page_url?: string
  links?: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path?: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

/**
 * Pagination state for the composable
 */
export interface PaginationState {
  page: number
  perPage: number
  total: number
  lastPage: number
  from: number | null
  to: number | null
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  page: number
  per_page: number
  filters: Record<string, any>
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
}

/**
 * Fetch function type
 */
export type FetchFunction<T = any> = (params: QueryParams) => Promise<LaravelPaginatorResponse<T>>

/**
 * Options for useResourceList composable
 */
export interface UseResourceListOptions<T = any> {
  fetchFunction: FetchFunction<T>
  filters?: FilterConfig[]
  defaultPerPage?: number
  perPageOptions?: number[]
  debounceMs?: number
  autoFetch?: boolean
}

/**
 * Return type for useResourceList composable
 */
export interface UseResourceListReturn<T = any> {
  // State
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  pagination: PaginationState
  sort: SortState
  filterValues: Record<string, any>

  // Computed
  first: ComputedRef<number>
  totalRecords: ComputedRef<number>
  activeFilters: ComputedRef<ActiveFilter[]>
  hasActiveFilters: ComputedRef<boolean>
  queryParams: ComputedRef<QueryParams>

  // Methods
  fetch: () => Promise<void>
  refresh: () => Promise<void>
  onPageChange: (event: { page: number; rows: number }) => void
  onSort: (event: { sortField: string; sortOrder: number }) => void
  setFilter: (key: string, value: any) => void
  removeFilter: (key: string) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
}

// ============================================================================
// COMPOSABLE IMPLEMENTATION
// ============================================================================

/**
 * Composable for managing resource lists with server-side pagination, sorting, and filtering
 *
 * @example
 * ```ts
 * const { data, loading, pagination, fetch, onPageChange, onSort } = useResourceList({
 *   fetchFunction: async (params) => {
 *     const response = await api.get('/products', { params })
 *     return response.data
 *   },
 *   filters: [
 *     { key: 'status', label: 'Status', type: 'dropdown', options: [...] },
 *     { key: 'search', label: 'Search', type: 'text' }
 *   ],
 *   defaultPerPage: 10
 * })
 * ```
 */
export function useResourceList<T = any>(
  options: UseResourceListOptions<T>
): UseResourceListReturn<T> {
  const {
    fetchFunction,
    filters: filterConfigs = [],
    defaultPerPage = 10,
    perPageOptions = [10, 20, 50, 100],
    debounceMs = 300,
    autoFetch = true
  } = options

  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = reactive<PaginationState>({
    page: 1,
    perPage: defaultPerPage,
    total: 0,
    lastPage: 1,
    from: null,
    to: null
  })

  const sort = reactive<SortState>({
    field: null,
    order: null
  })

  // Initialize filter values with defaults
  const filterValues = reactive<Record<string, any>>(
    filterConfigs.reduce((acc, filter) => {
      acc[filter.key] = filter.defaultValue ?? (filter.type === 'multiselect' ? [] : null)
      return acc
    }, {} as Record<string, any>)
  )

  // -------------------------------------------------------------------------
  // COMPUTED
  // -------------------------------------------------------------------------

  /**
   * First record index for PrimeVue Paginator (0-based)
   */
  const first = computed(() => (pagination.page - 1) * pagination.perPage)

  /**
   * Total records count
   */
  const totalRecords = computed(() => pagination.total)

  /**
   * Build query parameters for API request
   */
  const queryParams = computed<QueryParams>(() => {
    const params: QueryParams = {
      page: pagination.page,
      per_page: pagination.perPage,
      filters: {}
    }

    // Add non-empty filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value !== null && value !== undefined && value !== '' &&
          !(Array.isArray(value) && value.length === 0)) {
        params.filters[key] = value
      }
    }

    // Add sort if active
    if (sort.field && sort.order) {
      params.sort = {
        field: sort.field,
        order: sort.order
      }
    }

    return params
  })

  /**
   * List of active filters with display values for tag rendering
   */
  const activeFilters = computed<ActiveFilter[]>(() => {
    const active: ActiveFilter[] = []

    for (const config of filterConfigs) {
      const value = filterValues[config.key]

      if (value === null || value === undefined || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
        continue
      }

      let displayValue: string

      if (config.type === 'dropdown' && config.options) {
        const option = config.options.find(opt => opt.value === value)
        displayValue = option?.label ?? String(value)
      } else if (config.type === 'multiselect' && config.options && Array.isArray(value)) {
        const labels = value.map(v => {
          const option = config.options!.find(opt => opt.value === v)
          return option?.label ?? String(v)
        })
        displayValue = labels.join(', ')
      } else if (config.type === 'boolean') {
        displayValue = value ? 'Да' : 'Нет'
      } else if (config.type === 'date' && value instanceof Date) {
        displayValue = value.toLocaleDateString('ru-RU')
      } else if (config.type === 'daterange' && Array.isArray(value)) {
        const [start, end] = value
        const startStr = start instanceof Date ? start.toLocaleDateString('ru-RU') : ''
        const endStr = end instanceof Date ? end.toLocaleDateString('ru-RU') : ''
        displayValue = `${startStr} - ${endStr}`
      } else {
        displayValue = String(value)
      }

      active.push({
        key: config.key,
        label: config.label,
        value,
        displayValue
      })
    }

    return active
  })

  /**
   * Whether any filters are active
   */
  const hasActiveFilters = computed(() => activeFilters.value.length > 0)

  // -------------------------------------------------------------------------
  // METHODS
  // -------------------------------------------------------------------------

  /**
   * Fetch data from the server
   */
  async function fetch(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await fetchFunction(queryParams.value)

      // Map Laravel paginator response to internal state
      data.value = response.data
      pagination.total = response.total
      pagination.lastPage = response.last_page
      pagination.page = response.current_page
      pagination.perPage = response.per_page
      pagination.from = response.from
      pagination.to = response.to

    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : 'Произошла ошибка при загрузке данных'
      data.value = []
      pagination.total = 0
      pagination.lastPage = 1
      console.error('Error fetching resources:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh data (alias for fetch, resets to page 1)
   */
  async function refresh(): Promise<void> {
    pagination.page = 1
    await fetch()
  }

  /**
   * Handle page change from PrimeVue Paginator
   */
  function onPageChange(event: { page: number; rows: number }): void {
    // PrimeVue uses 0-based page index
    pagination.page = event.page + 1
    pagination.perPage = event.rows
    fetch()
  }

  /**
   * Handle sort change from PrimeVue DataTable
   */
  function onSort(event: { sortField: string; sortOrder: number }): void {
    sort.field = event.sortField
    sort.order = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : null
    pagination.page = 1
    fetch()
  }

  /**
   * Set a filter value
   */
  function setFilter(key: string, value: any): void {
    filterValues[key] = value
    pagination.page = 1
    fetch()
  }

  /**
   * Remove a specific filter
   */
  function removeFilter(key: string): void {
    const config = filterConfigs.find(f => f.key === key)
    filterValues[key] = config?.defaultValue ?? (config?.type === 'multiselect' ? [] : null)
    pagination.page = 1
    fetch()
  }

  /**
   * Clear all filters
   */
  function clearFilters(): void {
    for (const config of filterConfigs) {
      filterValues[config.key] = config.defaultValue ?? (config.type === 'multiselect' ? [] : null)
    }
    pagination.page = 1
    fetch()
  }

  /**
   * Set current page
   */
  function setPage(page: number): void {
    pagination.page = page
    fetch()
  }

  /**
   * Set items per page
   */
  function setPerPage(perPage: number): void {
    pagination.perPage = perPage
    pagination.page = 1
    fetch()
  }

  // -------------------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------------------

  // Auto-fetch on mount if enabled
  if (autoFetch) {
    fetch()
  }

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // State
    data,
    loading,
    error,
    pagination,
    sort,
    filterValues,

    // Computed
    first,
    totalRecords,
    activeFilters,
    hasActiveFilters,
    queryParams,

    // Methods
    fetch,
    refresh,
    onPageChange,
    onSort,
    setFilter,
    removeFilter,
    clearFilters,
    setPage,
    setPerPage
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Default date formatter
 */
export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return '—'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  }

  return date.toLocaleDateString('ru-RU', defaultOptions)
}

/**
 * Default datetime formatter
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return '—'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }

  return date.toLocaleString('ru-RU', defaultOptions)
}

/**
 * Default currency formatter
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'RUB',
  locale = 'ru-RU'
): string {
  if (value === null || value === undefined) return '—'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value)
}

/**
 * Default number formatter
 */
export function formatNumber(
  value: number | null | undefined,
  locale = 'ru-RU'
): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat(locale).format(value)
}

// ============================================================================
// DEFAULT ACTION CONFIGURATIONS
// ============================================================================

export const defaultActions: Record<'view' | 'edit' | 'delete', ActionConfig> = {
  view: {
    type: 'view',
    icon: 'pi pi-eye',
    severity: 'info',
    tooltip: 'Просмотр'
  },
  edit: {
    type: 'edit',
    icon: 'pi pi-pencil',
    severity: 'warning',
    tooltip: 'Редактировать'
  },
  delete: {
    type: 'delete',
    icon: 'pi pi-trash',
    severity: 'danger',
    tooltip: 'Удалить'
  }
}

// ============================================================================
// PER PAGE OPTIONS
// ============================================================================

export const defaultPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]
