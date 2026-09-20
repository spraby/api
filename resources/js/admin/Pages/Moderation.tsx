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

type ModerationStatus = "pending" | "approved" | "rejected"

interface ModerationSource {
  type: string
  id: number
  label: string
  admin_url: string | null
  exists: boolean
}

interface ModerationReviewer {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
}

interface ModerationRequestRow {
  id: number
  type: string
  status: ModerationStatus
  reason: string | null
  settings: Record<string, unknown> | null
  reviewed_at: string | null
  created_at: string | null
  source: ModerationSource | null
  reviewer: ModerationReviewer | null
}

function reviewerLabel(reviewer: ModerationReviewer | null): string {
  if (!reviewer) {
    return "—"
  }

  return `${reviewer.first_name ?? ""} ${reviewer.last_name ?? ""}`.trim() || reviewer.email
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_CONFIG: Record<ModerationStatus, { cls: string; Icon: typeof ClockIcon }> = {
  pending: {
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Icon: ClockIcon,
  },
  approved: {
    cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Icon: CheckCircle2Icon,
  },
  rejected: {
    cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Icon: XCircleIcon,
  },
}

function StatusBadge({ status, t }: { status: ModerationStatus; t: (k: string) => string }) {
  const config = STATUS_CONFIG[status]

  if (!config) {
    return <Badge variant="outline">{status}</Badge>
  }

  const { cls, Icon } = config

  return (
    <Badge className={cls} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.moderation.statuses.${status}`)}
    </Badge>
  )
}

const createColumns = (
  t: (key: string) => string,
  onOpenSource: (row: ModerationRequestRow) => void,
): ColumnDef<ModerationRequestRow>[] => [
  {
    id: "source",
    accessorFn: (row) => row.source?.label ?? "",
    header: t("admin.moderation.columns.source"),
    cell: ({ row }) => {
      const { source } = row.original

      return (
        <div className="space-y-0.5">
          <div className="font-medium">{source?.label ?? "—"}</div>
          {source && !source.exists ? (
            <div className="text-xs text-muted-foreground">
              {t("admin.moderation.source_deleted")}
            </div>
          ) : null}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const haystack = `${row.original.source?.label ?? ""} ${row.original.type}`.toLowerCase()

      return haystack.includes(String(value).toLowerCase())
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: t("admin.moderation.columns.type"),
    cell: ({ row }) => {
      const type = row.getValue<string>("type")
      const label = t(`admin.moderation.types.${type}`)

      return <Badge variant="secondary">{label.startsWith("admin.") ? type : label}</Badge>
    },
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }

      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "status",
    header: t("admin.moderation.columns.status"),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }

      return row.getValue(id) === value
    },
  },
  {
    id: "reviewer",
    header: t("admin.moderation.columns.reviewer"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{reviewerLabel(row.original.reviewer)}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: t("admin.moderation.columns.created"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatDate(row.getValue("created_at"))}
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
              <span className="sr-only">{t("admin.moderation.actions.open_menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              disabled={!row.original.source?.admin_url}
              onClick={() => {
                onOpenSource(row.original)
              }}
            >
              {t("admin.moderation.actions.open_source")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export default function Moderation() {
  const { t } = useLang()
  const { moderationRequests, types, statuses } = usePage<{
    moderationRequests: ModerationRequestRow[]
    types: string[]
    statuses: string[]
  }>().props

  const handleOpenSource = React.useCallback((row: ModerationRequestRow) => {
    if (row.source?.admin_url) {
      router.visit(row.source.admin_url)
    }
  }, [])

  const columns = React.useMemo(() => createColumns(t, handleOpenSource), [t, handleOpenSource])

  const filters: Filter[] = React.useMemo(
    () => [
      {
        type: "search",
        columnId: "source",
        placeholder: t("admin.moderation.filters.search_placeholder"),
      },
      {
        type: "custom",
        columnId: "type",
        render: ({ value, onChange }) => (
          <Select
            value={value || "all"}
            onValueChange={(newValue) => {
              onChange(newValue === "all" ? "" : newValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder={t("admin.moderation.filters.all_types")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.moderation.filters.all_types")}</SelectItem>
              {(types ?? []).map((type) => {
                const label = t(`admin.moderation.types.${type}`)

                return (
                  <SelectItem key={type} value={type}>
                    {label.startsWith("admin.") ? type : label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        ),
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
              <SelectValue placeholder={t("admin.moderation.filters.all_statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.moderation.filters.all_statuses")}</SelectItem>
              {(statuses ?? []).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`admin.moderation.statuses.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    [t, types, statuses],
  )

  const translations: ResourceListTranslations = React.useMemo(
    () => ({
      empty: t("admin.moderation.empty"),
      selected: t("admin.moderation.bulk.selected"),
      rowsSelected: t("admin.moderation.pagination.rows_selected"),
      row: t("admin.moderation.pagination.row"),
      rowsPerPage: t("admin.moderation.pagination.rows_per_page"),
      page: t("admin.moderation.pagination.page"),
      of: t("admin.moderation.pagination.of"),
      goFirst: t("admin.moderation.pagination.go_first"),
      goPrevious: t("admin.moderation.pagination.go_previous"),
      goNext: t("admin.moderation.pagination.go_next"),
      goLast: t("admin.moderation.pagination.go_last"),
      columns: t("admin.moderation.filters.columns"),
      clearSelection: t("admin.moderation.bulk.clear_selection"),
    }),
    [t],
  )

  return (
    <AdminLayout title={t("admin.moderation.title")}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {t("admin.moderation.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.moderation.description")}
            </p>
          </div>
        </div>

        <ResourceList
          columns={columns}
          data={moderationRequests ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  )
}
