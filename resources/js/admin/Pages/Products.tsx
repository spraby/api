import * as React from "react"

import { router, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, ImageIcon, MoreVerticalIcon, PackageIcon, PlusIcon, Trash2Icon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { ResourceList } from '@/components/resource-list';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLang } from '@/lib/lang';
import type { BulkAction, Filter, ResourceListTranslations } from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type { ColumnDef } from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: string;
  final_price: string;
  enabled: boolean;
  brand_id: number;
  category_id: number | null;
  brand: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  image_url: string | null;
  created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createProductColumns = (
  t: (key: string) => string,
  onDelete: (product: Product) => void,
  isDeleting: boolean
): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => { table.toggleAllPageRowsSelected(!!value); }}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => { row.toggleSelected(!!value); }}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: t('admin.products_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: t('admin.products_table.columns.image'),
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => {
              router.visit(`/sb/admin/products/${product.id}/edit`)
            }}
            aria-label={t('admin.products_table.actions.edit')}
          >
            {product.image_url ? (
              <img
                alt={product.title}
                className="size-12 rounded-md border object-cover"
                src={product.image_url}
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
              </div>
            )}
          </button>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: t('admin.products_table.columns.title'),
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{product.title}</span>
          {!!product.category && <span className="text-sm text-muted-foreground">{product.category.name}</span>}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const product = row.original
      const title = product.title.toLowerCase()
      const searchValue = value.toLowerCase()

      return title.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: t('admin.products_table.columns.price'),
    cell: ({ row }) => {
      const product = row.original
      const hasDiscount = product.price !== product.final_price

      return (
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price}
              </span>
              <span className="font-medium text-destructive">
                ${product.final_price}
              </span>
            </>
          ) : (
            <span className="font-medium">${product.price}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "enabled",
    header: t('admin.products_table.columns.status'),
    cell: ({ row }) => {
      const enabled = row.getValue("enabled")

      return enabled ? (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
          <CheckCircle2Icon className="mr-1 size-3" />
          {t('admin.products_table.status.enabled')}
        </Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" variant="outline">
          <XCircleIcon className="mr-1 size-3" />
          {t('admin.products_table.status.disabled')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id)

      if (value === "all") {return true}
      if (value === "enabled") {return rowValue === true}
      if (value === "disabled") {return rowValue === false}

      return true
    },
  },
  {
    accessorKey: "brand",
    header: t('admin.products_table.columns.brand'),
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="text-sm">
          {product.brand?.name || "—"}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: t('admin.products_table.columns.created'),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))

      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      const handleEdit = () => {
        router.visit(`/sb/admin/products/${product.id}/edit`)
      }

      const handleDelete = () => {
        // eslint-disable-next-line no-alert
        if (!confirm(`${t('admin.products_table.confirm.delete_one')} ${product.title}?`)) {
          return
        }

        onDelete(product)
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                disabled={isDeleting}
                size="icon"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">{t('admin.products_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEdit}>{t('admin.products_table.actions.edit')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                {t('admin.products_table.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// ============================================
// MAIN COMPONENT
// ============================================

// Bulk Actions Select Component
interface BulkStatusSelectProps {
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  t: (key: string) => string;
}

function BulkStatusSelect({ selectedStatus, setSelectedStatus, t }: BulkStatusSelectProps) {
  return (
    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
      <SelectTrigger className="h-9 w-full sm:w-40">
        <SelectValue placeholder={t('admin.products_table.bulk.change_status')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="enabled">{t('admin.products_table.status.enabled')}</SelectItem>
        <SelectItem value="disabled">{t('admin.products_table.status.disabled')}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function Products() {
  const { t } = useLang();
  const { products } = usePage<{ products: Product[] }>().props;

  // State for operations
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("")

  // Delete single product
  const handleDelete = React.useCallback((product: Product) => {
    setIsDeleting(true);

    router.delete(route('sb.admin.products.destroy', { product: product.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.products_table.success.deleted'));
      },
      onError: () => {
        toast.error(t('admin.products_table.errors.delete_failed'));
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  }, [t]);

  // Bulk actions slot renderer
  const renderBulkActionsSlot = React.useCallback(() => (
    <BulkStatusSelect
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      t={t}
    />
  ), [selectedStatus, t]);

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createProductColumns(t, handleDelete, isDeleting),
    [t, handleDelete, isDeleting]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<Product>[] = React.useMemo(() => [
    // Bulk Status Change
    {
      id: "change-status",
      label: t('admin.products_table.bulk.update_status'),
      icon: PackageIcon,
      variant: "outline",
      disabled: () => !selectedStatus,
      action: async (selectedProducts: Product[]) => {
        const productIds = selectedProducts.map(p => p.id)

        router.post(route('sb.admin.products.bulk-update-status'), {
          product_ids: productIds,
          enabled: selectedStatus === "enabled"
        }, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(t('admin.products_table.success.status_updated'));
            setSelectedStatus("");
          },
          onError: () => {
            toast.error(t('admin.products_table.errors.status_update_failed'));
          },
        });
      },
    },
    // Bulk Delete
    {
      id: "delete",
      label: t('admin.products_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedProducts: Product[]) =>
        `${t('admin.products_table.confirm.delete_many')} ${selectedProducts.length} ${t('admin.products_table.confirm.products')}`,
      action: async (selectedProducts: Product[]) => {
        const productIds = selectedProducts.map(p => p.id)

        router.post(route('sb.admin.products.bulk-delete'), {
          product_ids: productIds
        }, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(t('admin.products_table.success.bulk_deleted'));
          },
          onError: () => {
            toast.error(t('admin.products_table.errors.bulk_delete_failed'));
          },
        });
      },
    },
  ], [t, selectedStatus]);

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "title",
      placeholder: t('admin.products_table.filters.search_placeholder'),
    },
    // Status filter
    {
      type: "custom",
      columnId: "enabled",
      render: ({ value, onChange }) => (
        <Select
          value={value || "all"}
          onValueChange={(newValue) => { onChange(newValue === "all" ? "" : newValue); }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('admin.products_table.filters.all_statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.products_table.filters.all_statuses')}</SelectItem>
            <SelectItem value="enabled">{t('admin.products_table.status.enabled')}</SelectItem>
            <SelectItem value="disabled">{t('admin.products_table.status.disabled')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.products_table.empty'),
    selected: t('admin.products_table.bulk.selected'),
    rowsSelected: t('admin.products_table.pagination.rows_selected'),
    row: t('admin.products_table.pagination.row'),
    rowsPerPage: t('admin.products_table.pagination.rows_per_page'),
    page: t('admin.products_table.pagination.page'),
    of: t('admin.products_table.pagination.of'),
    goFirst: t('admin.products_table.pagination.go_first'),
    goPrevious: t('admin.products_table.pagination.go_previous'),
    goNext: t('admin.products_table.pagination.go_next'),
    goLast: t('admin.products_table.pagination.go_last'),
    columns: t('admin.products_table.filters.columns'),
    clearSelection: t('admin.products_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.products.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.products.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.products.description')}
            </p>
          </div>
          <Button
            onClick={() => {
              router.visit('/sb/admin/products/create');
            }}
          >
            <PlusIcon className="size-4" />
            {t('admin.products.actions.create')}
          </Button>
        </div>

        <ResourceList
          bulkActions={bulkActions}
          bulkActionsSlot={renderBulkActionsSlot}
          columns={columns}
          data={products ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}
