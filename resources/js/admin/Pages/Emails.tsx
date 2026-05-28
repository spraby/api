import * as React from "react"

import { router, usePage } from "@inertiajs/react"
import {
  AlertTriangleIcon,
  EyeIcon,
  MailCheckIcon,
  MoreVerticalIcon,
  RotateCwIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"

import { ResourceList } from "@/components/resource-list"
import { Button } from "@/components/ui/button"
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
import {
  EmailStatusBadge,
  formatEmailDateTime,
  templateLabel,
  type EmailStatus,
} from "@/lib/email-helpers"
import { useLang } from "@/lib/lang"
import type { Filter, ResourceListTranslations } from "@/types/resource-list"

import AdminLayout from "../layouts/AdminLayout.tsx"

import type { ColumnDef } from "@tanstack/react-table"

interface EmailMessage {
  id: number
  to_email: string
  to_name: string | null
  template_key: string
  subject: string
  locale: string
  status: EmailStatus
  attempts: number
  max_attempts: number
  last_error: string | null
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

interface EmailsPageProps {
  emails: EmailMessage[]
  templateKeys: string[]
}

const createEmailColumns = (
  t: (key: string) => string,
  onRetry: (id: number) => void,
  onCancel: (id: number) => void,
  onOpen: (id: number) => void,
  onResend: (email: EmailMessage) => void,
  onDelete: (id: number) => void,
): ColumnDef<EmailMessage>[] => [
  {
    accessorKey: "to_email",
    header: t("admin.emails_table.columns.recipient"),
    cell: ({ row }) => {
      const email = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{email.to_email}</span>
          {email.to_name ? (
            <span className="text-xs text-muted-foreground">{email.to_name}</span>
          ) : null}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const email = row.original
      const haystack = `${email.to_email} ${email.to_name ?? ""} ${email.subject}`.toLowerCase()
      return haystack.includes(String(value).toLowerCase())
    },
    enableHiding: false,
  },
  {
    accessorKey: "subject",
    header: t("admin.emails_table.columns.subject"),
    cell: ({ row }) => (
      <div className="block max-w-[28rem] truncate">{row.original.subject}</div>
    ),
  },
  {
    accessorKey: "template_key",
    header: t("admin.emails_table.columns.template"),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {templateLabel(row.getValue("template_key"), t)}
      </span>
    ),
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "status",
    header: t("admin.emails_table.columns.status"),
    cell: ({ row }) => <EmailStatusBadge status={row.getValue("status")} t={t} />,
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "attempts",
    header: t("admin.emails_table.columns.attempts"),
    cell: ({ row }) => {
      const email = row.original
      const exhausted = email.attempts >= email.max_attempts
      return (
        <div
          className={`flex items-center gap-1 text-sm ${
            exhausted ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          }`}
        >
          {exhausted ? <AlertTriangleIcon className="size-3.5" /> : null}
          <span>
            {email.attempts}/{email.max_attempts}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "scheduled_at",
    header: t("admin.emails_table.columns.scheduled_at"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatEmailDateTime(row.original.scheduled_at)}
      </div>
    ),
  },
  {
    accessorKey: "sent_at",
    header: t("admin.emails_table.columns.sent_at"),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{formatEmailDateTime(row.original.sent_at)}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const email = row.original
      const canRetry = email.status === "failed"
      const canCancel = email.status === "pending"

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
                <span className="sr-only">{t("admin.emails_table.actions.open_menu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  onOpen(email.id)
                }}
              >
                <EyeIcon className="size-4" />
                {t("admin.emails_table.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onResend(email)
                }}
              >
                <MailCheckIcon className="size-4" />
                {t("admin.emails_table.actions.resend")}
              </DropdownMenuItem>
              {canRetry ? (
                <DropdownMenuItem
                  onClick={() => {
                    onRetry(email.id)
                  }}
                >
                  <RotateCwIcon className="size-4" />
                  {t("admin.emails_table.actions.retry")}
                </DropdownMenuItem>
              ) : null}
              {canCancel ? (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    onCancel(email.id)
                  }}
                >
                  <XCircleIcon className="size-4" />
                  {t("admin.emails_table.actions.cancel")}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  onDelete(email.id)
                }}
              >
                <Trash2Icon className="size-4" />
                {t("admin.emails_table.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export default function Emails() {
  const { t } = useLang()
  const { emails, templateKeys } = usePage<EmailsPageProps>().props

  const handleRetry = React.useCallback(
    (id: number) => {
      router.post(
        `/admin/emails/${id}/retry`,
        {},
        { preserveScroll: true },
      )
    },
    [],
  )

  const handleCancel = React.useCallback(
    (id: number) => {
      if (!window.confirm(t("admin.emails_table.confirm.cancel"))) {
        return
      }
      router.post(
        `/admin/emails/${id}/cancel`,
        {},
        { preserveScroll: true },
      )
    },
    [t],
  )

  const handleOpen = React.useCallback(
    (id: number) => {
      router.visit(`/admin/emails/${id}`)
    },
    [],
  )

  const handleResend = React.useCallback(
    (email: EmailMessage) => {
      if (
        !window.confirm(
          t("admin.emails_table.confirm.resend").replace(":email", email.to_email),
        )
      ) {
        return
      }
      router.post(`/admin/emails/${email.id}/resend`, {}, { preserveScroll: true })
    },
    [t],
  )

  const handleDelete = React.useCallback(
    (id: number) => {
      if (!window.confirm(t("admin.emails_table.confirm.delete"))) {
        return
      }
      router.delete(`/admin/emails/${id}`, { preserveScroll: true })
    },
    [t],
  )

  const columns = React.useMemo(
    () => createEmailColumns(t, handleRetry, handleCancel, handleOpen, handleResend, handleDelete),
    [t, handleRetry, handleCancel, handleOpen, handleResend, handleDelete],
  )

  const filters: Filter[] = React.useMemo(
    () => [
      {
        type: "search",
        columnId: "to_email",
        placeholder: t("admin.emails_table.filters.search_placeholder"),
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
              <SelectValue placeholder={t("admin.emails_table.filters.all_statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.emails_table.filters.all_statuses")}</SelectItem>
              <SelectItem value="pending">{t("admin.emails_table.status.pending")}</SelectItem>
              <SelectItem value="processing">
                {t("admin.emails_table.status.processing")}
              </SelectItem>
              <SelectItem value="sent">{t("admin.emails_table.status.sent")}</SelectItem>
              <SelectItem value="failed">{t("admin.emails_table.status.failed")}</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        type: "custom",
        columnId: "template_key",
        render: ({ value, onChange }) => (
          <Select
            value={value || "all"}
            onValueChange={(newValue) => {
              onChange(newValue === "all" ? "" : newValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder={t("admin.emails_table.filters.all_templates")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.emails_table.filters.all_templates")}
              </SelectItem>
              {(templateKeys ?? []).map((key) => (
                <SelectItem key={key} value={key}>
                  {templateLabel(key, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    [t, templateKeys],
  )

  const translations: ResourceListTranslations = React.useMemo(
    () => ({
      empty: t("admin.emails_table.empty"),
      selected: t("admin.emails_table.bulk.selected"),
      rowsSelected: t("admin.emails_table.pagination.rows_selected"),
      row: t("admin.emails_table.pagination.row"),
      rowsPerPage: t("admin.emails_table.pagination.rows_per_page"),
      page: t("admin.emails_table.pagination.page"),
      of: t("admin.emails_table.pagination.of"),
      goFirst: t("admin.emails_table.pagination.go_first"),
      goPrevious: t("admin.emails_table.pagination.go_previous"),
      goNext: t("admin.emails_table.pagination.go_next"),
      goLast: t("admin.emails_table.pagination.go_last"),
      columns: t("admin.emails_table.filters.columns"),
      clearSelection: t("admin.emails_table.bulk.clear_selection"),
    }),
    [t],
  )

  return (
    <AdminLayout title={t("admin.emails.title")}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {t("admin.emails.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.emails.description")}
            </p>
          </div>
        </div>

        <ResourceList
          columns={columns}
          data={emails ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
          onRowClick={(row) => {
            handleOpen(row.id)
          }}
        />
      </div>
    </AdminLayout>
  )
}
