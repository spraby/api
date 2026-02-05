import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardMetrics } from "./types"

type KpiGridProps = {
  metrics: DashboardMetrics;
  periodLabel: string;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  t: (key: string) => string;
};

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="min-h-[120px]">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        {hint}
      </CardContent>
    </Card>
  )
}

export function DashboardKpiGrid({
  metrics,
  periodLabel,
  currencyFormatter,
  numberFormatter,
  t,
}: KpiGridProps) {
  const items = React.useMemo(() => [
    {
      label: t("admin.dashboard.kpi.revenue"),
      value: currencyFormatter.format(metrics.revenue),
    },
    {
      label: t("admin.dashboard.kpi.orders"),
      value: numberFormatter.format(metrics.orders),
    },
    {
      label: t("admin.dashboard.kpi.aov"),
      value: currencyFormatter.format(metrics.aov),
    },
    {
      label: t("admin.dashboard.kpi.units"),
      value: numberFormatter.format(metrics.units),
    },
    {
      label: t("admin.dashboard.kpi.views"),
      value: numberFormatter.format(metrics.views),
    },
    {
      label: t("admin.dashboard.kpi.add_to_cart"),
      value: numberFormatter.format(metrics.add_to_cart),
    },
    {
      label: t("admin.dashboard.kpi.conversion_view_to_atc"),
      value: `${metrics.conversion_view_to_atc.toFixed(1)}%`,
    },
    {
      label: t("admin.dashboard.kpi.conversion_view_to_order"),
      value: `${metrics.conversion_view_to_order.toFixed(1)}%`,
    },
  ], [
    currencyFormatter,
    metrics.add_to_cart,
    metrics.aov,
    metrics.conversion_view_to_atc,
    metrics.conversion_view_to_order,
    metrics.orders,
    metrics.revenue,
    metrics.units,
    metrics.views,
    numberFormatter,
    t,
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.label} label={item.label} value={item.value} hint={periodLabel} />
      ))}
    </div>
  );
}
