import * as React from "react"

import { router, usePage } from "@inertiajs/react"
import {
  CheckCircle2Icon,
  ClockIcon,
  MoreVerticalIcon,
  XCircleIcon,
} from "lucide-react"

import { ResourceList } from "@/components/resource-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useLang } from "@/lib/lang"
import type { Filter, ResourceListTranslations } from "@/types/resource-list"

import AdminLayout from "../layouts/AdminLayout.tsx"

import type { ColumnDef } from "@tanstack/react-table"

type RequestStatus = "pending" | "approved" | "partial" | "rejected"

interface RequestItem {
  id: number
  category_id: number
  status: string
  rejection_reason: string | null
  category: { id: number; name: string; handle: string } | null
}

interface CategoryRequestRow {
  id: number
  brand_id: number
  user_id: number | null
  status: RequestStatus
  comment: string
  reviewed_at: string | null
  created_at: string
  brand: { id: number; name: string } | null
  user: { id: number; email: string; first_name: string | null; last_name: string | null } | null
  items: RequestItem[]
}

function managerLabel(user: CategoryRequestRow["user"]): string {
  if (!user) {
    return "—"
  }

  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email
}

const STATUS_CONFIG: Record<RequestStatus, { cls: string; Icon: typeof ClockIcon }> = {
  pending: {
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Icon: ClockIcon,
  },
  approved: {
    cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Icon: CheckCircle2Icon,
  },
  partial: {
    cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Icon: CheckCircle2Icon,
  },
  rejected: {
    cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Icon: XCircleIcon,
  },
}

function StatusBadge({ status, t }: { status: RequestStatus; t: (k: string) => string }) {
  const { cls, Icon } = STATUS_CONFIG[status]

  return (
    <Badge className={cls} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.category_requests.statuses.${status}`)}
    </Badge>
  )
}

const createColumns = (
  t: (key: string) => string,
  onView: (id: number) => void,
): ColumnDef<CategoryRequestRow>[] => [
  {
    id: "brand",
    accessorFn: (row) => row.brand?.name ?? "",
    header: t("admin.category_requests.columns.brand"),
    cell: ({ row }) => <div className="font-medium">{row.original.brand?.name ?? "—"}</div>,
    filterFn: (row, _id, value) => {
      const r = row.original
      const haystack = `${r.brand?.name ?? ""} ${managerLabel(r.user)}`.toLowerCase()

      return haystack.includes(String(value).toLowerCase())
    },
    enableHiding: false,
  },
  {
    id: "manager",
    header: t("admin.category_requests.columns.manager"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{managerLabel(row.original.user)}</div>
    ),
  },
  {
    id: "categories",
    header: t("admin.category_requests.columns.categories"),
    cell: ({ row }) => {
      const { items } = row.original

      if (items.length === 0) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="flex max-w-[24rem] flex-wrap gap-1">
          {items.map((item) => (
            <Badge key={item.id} variant="secondary">
              {item.category?.name ?? "—"}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: t("admin.category_requests.columns.status"),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }

      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "created_at",
    header: t("admin.category_requests.columns.created"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("created_at")).toLocaleString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
              variant="ghost"
            >
              <MoreVerticalIcon className="size-4" />
              <span className="sr-only">{t("admin.category_requests.actions.open_menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => {
                onView(row.original.id)
              }}
            >
              {t("admin.category_requests.actions.view")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export default function CategoryRequests() {
  const { t } = useLang()
  const { categoryRequests } = usePage<{ categoryRequests: CategoryRequestRow[] }>().props

  const handleView = React.useCallback((id: number) => {
    router.visit(`/admin/category-requests/${id}`)
  }, [])

  const columns = React.useMemo(() => createColumns(t, handleView), [t, handleView])

  const filters: Filter[] = React.useMemo(
    () => [
      {
        type: "search",
        columnId: "brand",
        placeholder: t("admin.category_requests.filters.search_placeholder"),
      },
      {
        type: "custom",
        columnId: "status",
        render: ({ value, onChange }) => (
          <Select
            value={value || "all"}
            onValueChange={(newValue) => {
              onChange(newValue === "all" ? "" : newValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t("admin.category_requests.filters.all_statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.category_requests.filters.all_statuses")}
              </SelectItem>
              <SelectItem value="pending">
                {t("admin.category_requests.statuses.pending")}
              </SelectItem>
              <SelectItem value="approved">
                {t("admin.category_requests.statuses.approved")}
              </SelectItem>
              <SelectItem value="partial">
                {t("admin.category_requests.statuses.partial")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("admin.category_requests.statuses.rejected")}
              </SelectItem>
            </SelectContent>
          </Select>
        ),
      },
    ],
    [t],
  )

  const translations: ResourceListTranslations = React.useMemo(
    () => ({
      empty: t("admin.category_requests.empty"),
      selected: t("admin.category_requests.bulk.selected"),
      rowsSelected: t("admin.category_requests.pagination.rows_selected"),
      row: t("admin.category_requests.pagination.row"),
      rowsPerPage: t("admin.category_requests.pagination.rows_per_page"),
      page: t("admin.category_requests.pagination.page"),
      of: t("admin.category_requests.pagination.of"),
      goFirst: t("admin.category_requests.pagination.go_first"),
      goPrevious: t("admin.category_requests.pagination.go_previous"),
      goNext: t("admin.category_requests.pagination.go_next"),
      goLast: t("admin.category_requests.pagination.go_last"),
      columns: t("admin.category_requests.filters.columns"),
      clearSelection: t("admin.category_requests.bulk.clear_selection"),
    }),
    [t],
  )

  return (
    <AdminLayout title={t("admin.category_requests.title")}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {t("admin.category_requests.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.category_requests.description")}
            </p>
          </div>
        </div>

        <ResourceList
          columns={columns}
          data={categoryRequests ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
          onRowClick={(row) => {
            handleView(row.id)
          }}
        />
      </div>
    </AdminLayout>
  )
}
