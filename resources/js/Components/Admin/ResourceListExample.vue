<script setup lang="ts">
/**
 * ============================================================================
 * ResourceList Usage Example
 * ============================================================================
 *
 * ## Laravel Paginator to PrimeVue Mapping
 *
 * Laravel paginator returns:
 * {
 *   "current_page": 1,
 *   "data": [...],
 *   "from": 1,
 *   "last_page": 12,
 *   "per_page": 10,
 *   "to": 10,
 *   "total": 120
 * }
 *
 * | Laravel Field   | Internal State       | PrimeVue Component      |
 * |-----------------|----------------------|-------------------------|
 * | current_page    | pagination.page      | Paginator (page+1)      |
 * | per_page        | pagination.perPage   | Paginator :rows         |
 * | total           | pagination.total     | Paginator :totalRecords |
 * | from/to         | pagination.from/to   | Display info            |
 * | data            | data                 | DataTable :value        |
 *
 * Note: Laravel uses 1-based page index, PrimeVue uses 0-based.
 * The composable handles this conversion automatically.
 */

import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import ResourceList from '@/Components/Admin/ResourceList.vue'
import type {
  ColumnConfig,
  FilterConfig,
  ActionConfig,
  LaravelPaginatorResponse,
  QueryParams
} from '@/composables/useResourceList'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Product {
  id: number
  name: string
  sku: string
  price: number
  status: 'active' | 'inactive' | 'draft'
  category_name: string
  stock: number
  image_url: string | null
  created_at: string
}

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
    field: 'image_url',
    header: 'Фото',
    type: 'image',
    width: '70px'
  },
  {
    field: 'name',
    header: 'Название',
    sortable: true,
    minWidth: '200px'
  },
  {
    field: 'sku',
    header: 'Артикул',
    sortable: true,
    width: '120px'
  },
  {
    field: 'price',
    header: 'Цена',
    sortable: true,
    width: '130px',
    type: 'currency',
    currencyOptions: { currency: 'RUB', locale: 'ru-RU' }
  },
  {
    field: 'stock',
    header: 'Остаток',
    sortable: true,
    width: '100px',
    type: 'number'
  },
  {
    field: 'status',
    header: 'Статус',
    sortable: true,
    width: '130px',
    type: 'status',
    statusMap: {
      active: { label: 'Активный', severity: 'success' },
      inactive: { label: 'Неактивный', severity: 'secondary' },
      draft: { label: 'Черновик', severity: 'warning' }
    }
  },
  {
    field: 'created_at',
    header: 'Создан',
    sortable: true,
    width: '120px',
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
    width: '250px'
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'dropdown',
    placeholder: 'Все статусы',
    options: [
      { label: 'Активный', value: 'active' },
      { label: 'Неактивный', value: 'inactive' },
      { label: 'Черновик', value: 'draft' }
    ]
  },
  {
    key: 'categories',
    label: 'Категории',
    type: 'multiselect',
    placeholder: 'Выберите категории',
    options: [
      { label: 'Электроника', value: 1 },
      { label: 'Одежда', value: 2 },
      { label: 'Дом и сад', value: 3 }
    ]
  },
  {
    key: 'in_stock',
    label: 'В наличии',
    type: 'boolean'
  }
]

// ============================================================================
// ACTIONS CONFIGURATION
// ============================================================================

const actions: ActionConfig[] = [
  {
    type: 'view',
    icon: 'pi pi-eye',
    severity: 'info',
    tooltip: 'Просмотр'
  },
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
    disabled: (row: Product) => row.status === 'active'
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
    if (Array.isArray(value)) {
      value.forEach(v => queryParams.append(`${key}[]`, String(v)))
    } else {
      queryParams.set(key, String(value))
    }
  }

  // Sorting
  if (params.sort) {
    queryParams.set('sort_by', params.sort.field)
    queryParams.set('sort_order', params.sort.order)
  }

  const response = await fetch(`/api/products?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const resourceListRef = ref<InstanceType<typeof ResourceList> | null>(null)

function handleCreate() {
  router.visit('/admin/products/create')
}

function handleView(product: Product) {
  router.visit(`/admin/products/${product.id}`)
}

function handleEdit(product: Product) {
  router.visit(`/admin/products/${product.id}/edit`)
}

async function handleDelete(product: Product) {
  try {
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    resourceListRef.value?.refresh()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
</script>

<template>
  <ResourceList
    ref="resourceListRef"
    title="Товары"
    :columns="columns"
    :filters="filters"
    :actions="actions"
    :fetch-function="fetchProducts"
    :default-per-page="20"
    create-button-label="Добавить товар"
    :delete-confirm-message="(row) => `Удалить товар «${row.name}»?`"
    @create="handleCreate"
    @view="handleView"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<!--
================================================================================
LARAVEL CONTROLLER EXAMPLE
================================================================================

<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('category')
            ->select('products.*', 'categories.name as category_name')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id');

        // Search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('products.name', 'ilike', "%{$request->search}%")
                  ->orWhere('products.sku', 'ilike', "%{$request->search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('products.status', $request->status);
        }

        // Categories filter (multiselect)
        if ($request->filled('categories')) {
            $query->whereIn('products.category_id', $request->categories);
        }

        // In stock filter
        if ($request->boolean('in_stock')) {
            $query->where('products.stock', '>', 0);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy("products.{$sortBy}", $sortOrder);

        return $query->paginate($request->get('per_page', 10));
    }
}
-->
