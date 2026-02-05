import * as React from "react"

import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type OrderStatusWidget = {
  health: number | null;
  paid_total: number;
  paid_count: number;
  unpaid_total: number;
  unpaid_count: number;
  active_total: number;
  needs_attention: number;
  status_total: number;
  status_counts: {
    pending: number;
    confirmed: number;
    processing: number;
    completed: number;
    cancelled: number;
    archived: number;
  };
  attention: {
    key: "pending" | "processing" | "unpaid";
    count: number;
    days: number;
  }[];
};

type OrdersStatusWidgetProps = {
  data: OrderStatusWidget;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  t: (key: string) => string;
  trans: (key: string, replacements?: Record<string, string | number>) => string;
  ordersHref: string;
};

export function OrdersStatusWidget({
  data,
  currencyFormatter,
  numberFormatter,
  t,
  trans,
  ordersHref,
}: OrdersStatusWidgetProps) {
  const statusMeta = [
    { key: "pending", color: "#F59E0B", label: t("admin.orders_table.status.pending") },
    { key: "confirmed", color: "#3B82F6", label: t("admin.orders_table.status.confirmed") },
    { key: "processing", color: "#A855F7", label: t("admin.orders_table.status.processing") },
    { key: "completed", color: "#10B981", label: t("admin.orders_table.status.completed") },
    { key: "cancelled", color: "#EF4444", label: t("admin.orders_table.status.cancelled") },
    { key: "archived", color: "#94A3B8", label: t("admin.orders_table.status.archived") },
  ] as const;

  const statusSegments = statusMeta
    .map((item) => ({
      ...item,
      count: data.status_counts[item.key] ?? 0,
    }))
    .filter((item) => item.count > 0);

  const statusTotal = data.status_total;
  const paymentSegments = [
    {
      key: "unpaid",
      label: t("admin.dashboard.orders_widget.unpaid_total"),
      amount: data.unpaid_total,
      count: data.unpaid_count,
      color: "#EF4444",
      valueClass: "text-rose-600",
    },
    {
      key: "paid",
      label: t("admin.dashboard.orders_widget.paid_total"),
      amount: data.paid_total,
      count: data.paid_count,
      color: "#10B981",
      valueClass: "text-emerald-600",
    },
  ] as const;
  const paymentTotal = paymentSegments.reduce((sum, item) => sum + item.amount, 0);
  const healthValue = data.health;
  const healthDisplay = healthValue === null ? "—" : `${Math.round(healthValue)}%`;
  const healthColor = healthValue === null
    ? "#94A3B8"
    : healthValue >= 80
      ? "#10B981"
      : healthValue >= 60
        ? "#F59E0B"
        : "#EF4444";
  const healthDegrees = healthValue === null ? 0 : (healthValue / 100) * 360;
  const healthBackground = healthValue === null
    ? "conic-gradient(#e2e8f0 0deg, #e2e8f0 360deg)"
    : `conic-gradient(${healthColor} 0deg ${healthDegrees}deg, rgba(148, 163, 184, 0.25) ${healthDegrees}deg 360deg)`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{t("admin.dashboard.orders_widget.title")}</CardTitle>
          <CardDescription>{t("admin.dashboard.orders_widget.description")}</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ordersHref}>{t("admin.dashboard.orders_widget.cta")}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="flex items-center gap-4">
            <div className="relative size-24">
              <div className="absolute inset-0 rounded-full" style={{ background: healthBackground }} />
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-background/90 text-lg font-semibold shadow-sm">
                {healthDisplay}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("admin.dashboard.orders_widget.health_label")}</p>
              <p className="text-xs text-muted-foreground">
                {trans("admin.dashboard.orders_widget.active_total", {
                  count: numberFormatter.format(data.active_total),
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {trans("admin.dashboard.orders_widget.needs_attention", {
                  count: numberFormatter.format(data.needs_attention),
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {statusSegments.length === 0 ? (
                <div className="h-full w-full bg-muted" />
              ) : (
                statusSegments.map((segment) => (
                  <div
                    key={segment.key}
                    className="h-full"
                    style={{
                      width: `${statusTotal > 0 ? (segment.count / statusTotal) * 100 : 0}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {statusSegments.length === 0 ? (
                <span>{t("admin.dashboard.orders_widget.no_statuses")}</span>
              ) : (
                statusSegments.map((segment) => (
                  <div key={segment.key} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.label}</span>
                    <span className="font-medium text-foreground">
                      {numberFormatter.format(segment.count)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {paymentTotal <= 0 ? (
                  <div className="h-full w-full bg-muted" />
                ) : (
                  paymentSegments.map((segment) => (
                    <div
                      key={segment.key}
                      className="h-full"
                      style={{
                        width: `${(segment.amount / paymentTotal) * 100}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {paymentSegments.map((segment) => (
                  <div key={segment.key} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.label}</span>
                    <span className={`font-medium ${segment.valueClass}`}>
                      {currencyFormatter.format(segment.amount)}
                    </span>
                    <span className="text-muted-foreground">
                      {trans(`admin.dashboard.orders_widget.${segment.key}_count`, {
                        count: numberFormatter.format(segment.count),
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {data.attention.map((item) => (
            <div
              key={item.key}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                item.count > 0
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border"
              }`}
            >
              <span>
                {trans(`admin.dashboard.orders_widget.attention.${item.key}`, {
                  days: item.days,
                })}
              </span>
              <span className={item.count > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {numberFormatter.format(item.count)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
