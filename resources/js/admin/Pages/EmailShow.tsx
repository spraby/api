import * as React from "react"

import { Link, router } from "@inertiajs/react"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  MailCheckIcon,
  RotateCwIcon,
  SendIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  EmailStatusBadge,
  formatEmailDateTime,
  templateLabel,
  type EmailStatus,
} from "@/lib/email-helpers"
import { useLang } from "@/lib/lang"

import AdminLayout from "../layouts/AdminLayout"

interface EmailSource {
  type: string
  id: number
  label: string
  admin_url: string | null
}

interface EmailMessageDetail {
  id: number
  to_email: string
  to_name: string | null
  from_email: string | null
  from_name: string | null
  reply_to: string | null
  template_key: string
  subject: string
  payload: Record<string, unknown>
  locale: string
  status: EmailStatus
  attempts: number
  max_attempts: number
  last_error: string | null
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  source: EmailSource | null
  resend_url: string | null
  html_preview: string | null
}

interface EmailShowProps {
  email: EmailMessageDetail
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 text-sm">
      <div className="col-span-1 text-muted-foreground">{label}</div>
      <div className="col-span-2 break-words">{children}</div>
    </div>
  )
}

export default function EmailShow({ email }: EmailShowProps) {
  const { t } = useLang()

  const canRetry = email.status === "failed"
  const canCancel = email.status === "pending"

  const handleBack = () => {
    router.visit("/admin/emails")
  }

  const handleRetry = () => {
    router.post(`/admin/emails/${email.id}/retry`, {}, { preserveScroll: true })
  }

  const handleCancel = () => {
    if (!window.confirm(t("admin.emails_table.confirm.cancel"))) {
      return
    }
    router.post(`/admin/emails/${email.id}/cancel`, {}, { preserveScroll: true })
  }

  const handleSendCopy = () => {
    router.post(`/admin/emails/${email.id}/send-copy`, {}, { preserveScroll: true })
  }

  const handleResend = () => {
    if (!window.confirm(t("admin.email_show.confirm.resend").replace(":email", email.to_email))) {
      return
    }
    router.post(`/admin/emails/${email.id}/resend`, {}, { preserveScroll: true })
  }

  const handleDelete = () => {
    if (!window.confirm(t("admin.email_show.confirm.delete"))) {
      return
    }
    router.delete(`/admin/emails/${email.id}`)
  }

  const payloadJson = React.useMemo(
    () => JSON.stringify(email.payload ?? {}, null, 2),
    [email.payload],
  )

  return (
    <AdminLayout title={`${t("admin.email_show.title")} #${email.id}`}>
      <div className="flex items-center flex-col gap-5">
        <div className="max-w-[1100px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button className="size-8" size="icon" variant="ghost" onClick={handleBack}>
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t("admin.email_show.title")} #{email.id}
                </h1>
              </div>
              <div className="flex items-center gap-3 pl-10">
                <EmailStatusBadge status={email.status} t={t} />
                <span className="text-sm text-muted-foreground">
                  {formatEmailDateTime(email.created_at, true)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSendCopy}>
                <SendIcon className="mr-2 size-4" />
                {t("admin.email_show.actions.send_copy")}
              </Button>
              <Button variant="outline" onClick={handleResend}>
                <MailCheckIcon className="mr-2 size-4" />
                {t("admin.email_show.actions.resend")}
              </Button>
              {canRetry ? (
                <Button onClick={handleRetry}>
                  <RotateCwIcon className="mr-2 size-4" />
                  {t("admin.emails_table.actions.retry")}
                </Button>
              ) : null}
              {canCancel ? (
                <Button variant="destructive" onClick={handleCancel}>
                  <XCircleIcon className="mr-2 size-4" />
                  {t("admin.emails_table.actions.cancel")}
                </Button>
              ) : null}
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2Icon className="mr-2 size-4" />
                {t("admin.email_show.actions.delete")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.email_show.sections.meta")}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <MetaRow label={t("admin.email_show.fields.subject")}>
                  <span className="font-medium">{email.subject}</span>
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.template")}>
                  <div className="flex flex-col">
                    <span>{templateLabel(email.template_key, t)}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {email.template_key}
                    </span>
                  </div>
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.recipient")}>
                  <div className="flex flex-col">
                    <span>{email.to_email}</span>
                    {email.to_name ? (
                      <span className="text-xs text-muted-foreground">{email.to_name}</span>
                    ) : null}
                  </div>
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.sender")}>
                  {email.from_email ? (
                    <div className="flex flex-col">
                      <span>{email.from_email}</span>
                      {email.from_name ? (
                        <span className="text-xs text-muted-foreground">{email.from_name}</span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("admin.email_show.fields.sender_default")}
                    </span>
                  )}
                </MetaRow>
                {email.reply_to ? (
                  <MetaRow label={t("admin.email_show.fields.reply_to")}>{email.reply_to}</MetaRow>
                ) : null}
                <MetaRow label={t("admin.email_show.fields.locale")}>{email.locale}</MetaRow>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.email_show.sections.delivery")}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <MetaRow label={t("admin.email_show.fields.status")}>
                  <EmailStatusBadge status={email.status} t={t} />
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.attempts")}>
                  <span
                    className={
                      email.attempts >= email.max_attempts
                        ? "text-red-600 dark:text-red-400 inline-flex items-center gap-1"
                        : ""
                    }
                  >
                    {email.attempts >= email.max_attempts ? (
                      <AlertTriangleIcon className="size-3.5" />
                    ) : null}
                    {email.attempts}/{email.max_attempts}
                  </span>
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.scheduled_at")}>
                  {formatEmailDateTime(email.scheduled_at, true)}
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.sent_at")}>
                  {formatEmailDateTime(email.sent_at, true)}
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.created_at")}>
                  {formatEmailDateTime(email.created_at, true)}
                </MetaRow>
                <MetaRow label={t("admin.email_show.fields.updated_at")}>
                  {formatEmailDateTime(email.updated_at, true)}
                </MetaRow>
                {email.source ? (
                  <MetaRow label={t("admin.email_show.fields.source")}>
                    {email.source.admin_url ? (
                      <Link
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        href={email.source.admin_url}
                      >
                        {email.source.label} #{email.source.id}
                        <ExternalLinkIcon className="size-3" />
                      </Link>
                    ) : (
                      <span>
                        {email.source.label} #{email.source.id}
                      </span>
                    )}
                  </MetaRow>
                ) : null}
                {email.resend_url ? (
                  <MetaRow label={t("admin.email_show.fields.resend")}>
                    <a
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                      href={email.resend_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {t("admin.email_show.fields.resend_open")}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  </MetaRow>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {email.last_error ? (
            <Card className="border-red-200/60 dark:border-red-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangleIcon className="size-4" />
                  {t("admin.email_show.sections.error")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap break-all rounded-md bg-red-50 p-3 text-xs text-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {email.last_error}
                </pre>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.email_show.sections.preview")}</CardTitle>
            </CardHeader>
            <CardContent>
              {email.html_preview ? (
                <iframe
                  className="h-[640px] w-full rounded-md border bg-white"
                  sandbox=""
                  srcDoc={email.html_preview}
                  title={`email-preview-${email.id}`}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("admin.email_show.preview_unavailable")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.email_show.sections.payload")}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[480px] overflow-auto rounded-md bg-muted p-3 text-xs">
                {payloadJson}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
