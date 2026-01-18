import * as React from "react"

import { router, usePage } from '@inertiajs/react';
import {
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  MoreVerticalIcon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react"

import { ResourceList } from '@/components/resource-list';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Filter, ResourceListTranslations } from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type { ColumnDef } from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Order {
  id: number;
  name: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';
  delivery_status: 'pending' | 'packing' | 'shipped' | 'transit' | 'delivered';
  financial_status: 'unpaid' | 'paid' | 'partial_paid' | 'refunded';
  note: string | null;
  customer: Customer | null;
  items_count: number;
  total: number;
  created_at: string;
}

// ============================================
// STATUS BADGE COMPONENTS
// ============================================

function OrderStatusBadge({ status, t }: { status: Order['status']; t: (key: string) => string }) {
  const config = {
    pending: { icon: ClockIcon, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    confirmed: { icon: CheckCircle2Icon, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    processing: { icon: PackageIcon, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    completed: { icon: CheckCircle2Icon, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    cancelled: { icon: XCircleIcon, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    archived: { icon: PackageIcon, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  }

  const { icon: Icon, className } = config[status]

  return (
    <Badge className={className} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.orders_table.status.${status}`)}
    </Badge>
  )
}

function DeliveryStatusBadge({ status, t }: { status: Order['delivery_status']; t: (key: string) => string }) {
  const config = {
    pending: { icon: ClockIcon, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    packing: { icon: PackageIcon, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    shipped: { icon: TruckIcon, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    transit: { icon: TruckIcon, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    delivered: { icon: CheckCircle2Icon, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  }

  const { icon: Icon, className } = config[status]

  return (
    <Badge className={className} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.orders_table.delivery_status.${status}`)}
    </Badge>
  )
}

function FinancialStatusBadge({ status, t }: { status: Order['financial_status']; t: (key: string) => string }) {
  const config = {
    unpaid: { icon: CircleDollarSignIcon, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    paid: { icon: CircleDollarSignIcon, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    partial_paid: { icon: CircleDollarSignIcon, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    refunded: { icon: CircleDollarSignIcon, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  }

  const { icon: Icon, className } = config[status]

  return (
    <Badge className={className} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.orders_table.financial_status.${status}`)}
    </Badge>
  )
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createOrderColumns = (
  t: (key: string) => string,
): ColumnDef<Order>[] => [
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
    accessorKey: "name",
    header: t('admin.orders_table.columns.order'),
    cell: ({ row }) => {
      const order = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{order.name}</span>
          <span className="text-sm text-muted-foreground">
            {order.items_count} {t('admin.orders_table.items')}
          </span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const order = row.original
      const name = order.name.toLowerCase()
      const searchValue = value.toLowerCase()

      return name.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "customer",
    header: t('admin.orders_table.columns.customer'),
    cell: ({ row }) => {
      const order = row.original

      if (!order.customer) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{order.customer.name}</span>
          <span className="text-sm text-muted-foreground">{order.customer.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: t('admin.orders_table.columns.total'),
    cell: ({ row }) => {
      const order = row.original

      return (
        <span className="font-medium">
          ${order.total.toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: t('admin.orders_table.columns.status'),
    cell: ({ row }) => <OrderStatusBadge status={row.getValue("status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all") {return true}

      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "delivery_status",
    header: t('admin.orders_table.columns.delivery'),
    cell: ({ row }) => <DeliveryStatusBadge status={row.getValue("delivery_status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all") {return true}

      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "financial_status",
    header: t('admin.orders_table.columns.payment'),
    cell: ({ row }) => <FinancialStatusBadge status={row.getValue("financial_status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all") {return true}

      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "created_at",
    header: t('admin.orders_table.columns.created'),
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
      const order = row.original

      const handleView = () => {
        router.visit(`/sb/admin/orders/${order.id}`)
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">{t('admin.orders_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleView}>
                {t('admin.orders_table.actions.view')}
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

export default function Orders() {
  const { t } = useLang();
  const { orders } = usePage<{ orders: Order[] }>().props;

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createOrderColumns(t),
    [t]
  );

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "name",
      placeholder: t('admin.orders_table.filters.search_placeholder'),
    },
    // Status filter
    {
      type: "custom",
      columnId: "status",
      render: ({ value, onChange }) => (
        <Select
          value={value || "all"}
          onValueChange={(newValue) => { onChange(newValue === "all" ? "" : newValue); }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('admin.orders_table.filters.all_statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.orders_table.filters.all_statuses')}</SelectItem>
            <SelectItem value="pending">{t('admin.orders_table.status.pending')}</SelectItem>
            <SelectItem value="confirmed">{t('admin.orders_table.status.confirmed')}</SelectItem>
            <SelectItem value="processing">{t('admin.orders_table.status.processing')}</SelectItem>
            <SelectItem value="completed">{t('admin.orders_table.status.completed')}</SelectItem>
            <SelectItem value="cancelled">{t('admin.orders_table.status.cancelled')}</SelectItem>
            <SelectItem value="archived">{t('admin.orders_table.status.archived')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    // Financial status filter
    {
      type: "custom",
      columnId: "financial_status",
      render: ({ value, onChange }) => (
        <Select
          value={value || "all"}
          onValueChange={(newValue) => { onChange(newValue === "all" ? "" : newValue); }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('admin.orders_table.filters.all_payments')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.orders_table.filters.all_payments')}</SelectItem>
            <SelectItem value="unpaid">{t('admin.orders_table.financial_status.unpaid')}</SelectItem>
            <SelectItem value="paid">{t('admin.orders_table.financial_status.paid')}</SelectItem>
            <SelectItem value="partial_paid">{t('admin.orders_table.financial_status.partial_paid')}</SelectItem>
            <SelectItem value="refunded">{t('admin.orders_table.financial_status.refunded')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.orders_table.empty'),
    selected: t('admin.orders_table.bulk.selected'),
    rowsSelected: t('admin.orders_table.pagination.rows_selected'),
    row: t('admin.orders_table.pagination.row'),
    rowsPerPage: t('admin.orders_table.pagination.rows_per_page'),
    page: t('admin.orders_table.pagination.page'),
    of: t('admin.orders_table.pagination.of'),
    goFirst: t('admin.orders_table.pagination.go_first'),
    goPrevious: t('admin.orders_table.pagination.go_previous'),
    goNext: t('admin.orders_table.pagination.go_next'),
    goLast: t('admin.orders_table.pagination.go_last'),
    columns: t('admin.orders_table.filters.columns'),
    clearSelection: t('admin.orders_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.orders.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.orders.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.orders.description')}
            </p>
          </div>
        </div>

        <ResourceList
          columns={columns}
          data={orders ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}
