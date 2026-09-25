import { ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface BrandAccount {
  type: "master" | "business"
  employment_type_label: string | null
  has_pending_request: boolean
}

const TYPE_CLASSES = {
  master: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  business: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
} as const

/** Бейдж у заголовка дашборда: мастер или бизнес — от этого зависит набор аналитики. */
export function BrandAccountBadge({ account, t }: { account: BrandAccount; t: (key: string) => string }) {
  const label = [
    t(`admin.dashboard.brand_account.types.${account.type}`),
    account.employment_type_label,
  ].filter(Boolean).join(" · ")

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", TYPE_CLASSES[account.type])}>
      {label}
      {account.has_pending_request ? (
        <ClockIcon
          aria-label={t("admin.dashboard.brand_account.pending")}
          className="size-3"
        >
          <title>{t("admin.dashboard.brand_account.pending")}</title>
        </ClockIcon>
      ) : null}
    </Badge>
  )
}
