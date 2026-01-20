import * as React from "react"

import { router, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, ClockIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react"

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

interface BrandRequest {
  id: number;
  email: string;
  phone: string | null;
  name: string | null;
  brand_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  brand_id: number | null;
  user_id: number | null;
  rejection_reason: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  brand: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  reviewer: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createBrandRequestColumns = (
  t: (key: string) => string
): ColumnDef<BrandRequest>[] => [
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
    header: t('admin.brand_requests_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: t('admin.brand_requests_table.columns.email'),
    cell: ({ row }) => {
      const request = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{request.email}</span>
          {request.name ? <span className="text-sm text-muted-foreground">{request.name}</span> : null}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const request = row.original
      const email = request.email.toLowerCase()
      const name = (request.name || '').toLowerCase()
      const searchValue = value.toLowerCase()

      return email.includes(searchValue) || name.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: t('admin.brand_requests_table.columns.phone'),
    cell: ({ row }) => {
      const phone = row.getValue("phone")

      return (
        <div className="text-sm">
          {phone || "—"}
        </div>
      )
    },
  },
  {
    accessorKey: "brand_name",
    header: t('admin.brand_requests_table.columns.brand_name'),
    cell: ({ row }) => {
      const brandName = row.getValue("brand_name")

      return (
        <div className="font-medium">
          {brandName || "—"}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: t('admin.brand_requests_table.columns.status'),
    cell: ({ row }) => {
      const status = row.getValue("status")

      if (status === 'pending') {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" variant="outline">
            <ClockIcon className="mr-1 size-3" />
            {t('admin.brand_requests_table.status.pending')}
          </Badge>
        )
      }

      if (status === 'approved') {
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
            <CheckCircle2Icon className="mr-1 size-3" />
            {t('admin.brand_requests_table.status.approved')}
          </Badge>
        )
      }

      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" variant="outline">
          <XCircleIcon className="mr-1 size-3" />
          {t('admin.brand_requests_table.status.rejected')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id)

      if (value === "all") { return true }

      return rowValue === value
    },
  },
  {
    accessorKey: "created_at",
    header: t('admin.brand_requests_table.columns.created'),
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
      const request = row.original

      const handleView = () => {
        router.visit(`/sb/admin/brand-requests/${request.id}`)
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
                <span className="sr-only">{t('admin.brand_requests_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleView}>{t('admin.brand_requests_table.actions.view')}</DropdownMenuItem>
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

export default function BrandRequests() {
  const { t } = useLang();
  const { brandRequests } = usePage<{ brandRequests: BrandRequest[] }>().props;

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createBrandRequestColumns(t),
    [t]
  );

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "email",
      placeholder: t('admin.brand_requests_table.filters.search_placeholder'),
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
            <SelectValue placeholder={t('admin.brand_requests_table.filters.all_statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.brand_requests_table.filters.all_statuses')}</SelectItem>
            <SelectItem value="pending">{t('admin.brand_requests_table.status.pending')}</SelectItem>
            <SelectItem value="approved">{t('admin.brand_requests_table.status.approved')}</SelectItem>
            <SelectItem value="rejected">{t('admin.brand_requests_table.status.rejected')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.brand_requests_table.empty'),
    selected: t('admin.brand_requests_table.bulk.selected'),
    rowsSelected: t('admin.brand_requests_table.pagination.rows_selected'),
    row: t('admin.brand_requests_table.pagination.row'),
    rowsPerPage: t('admin.brand_requests_table.pagination.rows_per_page'),
    page: t('admin.brand_requests_table.pagination.page'),
    of: t('admin.brand_requests_table.pagination.of'),
    goFirst: t('admin.brand_requests_table.pagination.go_first'),
    goPrevious: t('admin.brand_requests_table.pagination.go_previous'),
    goNext: t('admin.brand_requests_table.pagination.go_next'),
    goLast: t('admin.brand_requests_table.pagination.go_last'),
    columns: t('admin.brand_requests_table.filters.columns'),
    clearSelection: t('admin.brand_requests_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.brand_requests.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.brand_requests.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.brand_requests.description')}
            </p>
          </div>
        </div>

        <ResourceList
          columns={columns}
          data={brandRequests ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}