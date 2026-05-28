import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

export type EmailStatus = "pending" | "processing" | "sent" | "failed"

const STATUS_CONFIG: Record<EmailStatus, { icon: typeof ClockIcon; className: string }> = {
  pending: {
    icon: ClockIcon,
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/60",
  },
  processing: {
    icon: Loader2Icon,
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/60",
  },
  sent: {
    icon: CheckCircle2Icon,
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/60",
  },
  failed: {
    icon: XCircleIcon,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/60",
  },
}

export function EmailStatusBadge({
  status,
  t,
}: {
  status: EmailStatus
  t: (key: string) => string
}) {
  const { icon: Icon, className } = STATUS_CONFIG[status]

  return (
    <Badge className={`gap-1 ${className}`} variant="outline">
      <Icon className={`size-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {t(`admin.emails_table.status.${status}`)}
    </Badge>
  )
}

export function templateLabel(
  templateKey: string,
  t: (key: string) => string,
): string {
  const key = `admin.emails_table.templates.${templateKey}`
  const label = t(key)

  return label === key ? templateKey : label
}

export function formatEmailDateTime(value: string | null, withSeconds = false): string {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" as const } : {}),
  })
}
