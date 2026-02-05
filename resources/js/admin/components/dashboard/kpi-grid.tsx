import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardMetrics } from "./types"

type KpiGridProps = {
  metrics: DashboardMetrics;
  orderStatus: {
    paid_total: number;
    unpaid_total: number;
    paid_count: number;
    unpaid_count: number;
  };
  categoryViews?: Array<{ label: string; value: number }>;
  categoryAddToCart?: Array<{ label: string; value: number }>;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  t: (key: string) => string;
};

type KpiChip = {
  label: string;
  value: string;
};

type KpiDetail = {
  label: string;
  value?: string;
};

type KpiCardData = {
  label: string;
  value: string;
  chips: KpiChip[];
  details: KpiDetail[];
  extra?: React.ReactNode;
};

const CATEGORY_COLORS = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6"];
const MAX_CATEGORY_ROWS = 3;

function CategoryBreakdown({
  items,
  t,
  numberFormatter,
  isPreview = false,
}: {
  items: Array<{ label: string; value: number }>;
  t: (key: string) => string;
  numberFormatter: Intl.NumberFormat;
  isPreview?: boolean;
}) {
  const rows = React.useMemo(() => {
    const safeItems = items
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = safeItems.reduce((sum, item) => sum + item.value, 0);
    const top = safeItems.slice(0, MAX_CATEGORY_ROWS);
    const otherValue = safeItems.slice(MAX_CATEGORY_ROWS).reduce((sum, item) => sum + item.value, 0);
    const withOther = otherValue > 0
      ? [...top, { label: t("admin.dashboard.kpi.category_other"), value: otherValue }]
      : top;
    return { rows: withOther, total };
  }, [items, t]);

  if (rows.rows.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {t("admin.dashboard.kpi.category_breakdown_empty")}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${isPreview ? "opacity-60" : ""}`}>
      {rows.rows.map((item, index) => {
        const percent = rows.total > 0 ? (item.value / rows.total) * 100 : 0;
        const isOther = item.label === t("admin.dashboard.kpi.category_other");
        const color = isOther
          ? "#64748B"
          : CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        return (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {numberFormatter.format(item.value)}
              </span>
              <span className="text-muted-foreground">{percent.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ label, value, chips, details, extra }: KpiCardData) {
  return (
    <Card className="min-h-[120px]">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2 pb-2">
            {chips.map((chip) => (
              <span
                key={`${label}-${chip.label}`}
                className="rounded-full border px-2 py-0.5 text-[11px] text-foreground"
              >
                <span className="text-muted-foreground">{chip.label}</span>{" "}
                <span className="font-medium">{chip.value}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className="grid gap-1">
          {details.map((detail) => (
            <div key={`${label}-${detail.label}`} className="flex items-center justify-between gap-2">
              <span>{detail.label}</span>
              {detail.value !== undefined ? (
                <span className="font-medium text-foreground">{detail.value}</span>
              ) : null}
            </div>
          ))}
        </div>
        {extra ? (
          <div className="mt-1 border-t pt-2">
            {extra}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function DashboardKpiGrid({
  metrics,
  orderStatus,
  categoryViews = [],
  categoryAddToCart = [],
  currencyFormatter,
  numberFormatter,
  t,
}: KpiGridProps) {
  const cartToOrder = React.useMemo(
    () => (metrics.add_to_cart > 0 ? (metrics.orders / metrics.add_to_cart) * 100 : 0),
    [metrics.add_to_cart, metrics.orders]
  );
  const categoryPreview = React.useMemo(() => ([
    { label: t("admin.dashboard.kpi.category_preview_1"), value: 120 },
    { label: t("admin.dashboard.kpi.category_preview_2"), value: 85 },
    { label: t("admin.dashboard.kpi.category_preview_3"), value: 55 },
    { label: t("admin.dashboard.kpi.category_other"), value: 32 },
  ]), [t]);
  const hasCategoryData = categoryViews.length > 0;
  const categoryItems = hasCategoryData ? categoryViews : categoryPreview;
  const cartPreview = React.useMemo(() => ([
    { label: t("admin.dashboard.kpi.category_preview_1"), value: 22 },
    { label: t("admin.dashboard.kpi.category_preview_2"), value: 14 },
    { label: t("admin.dashboard.kpi.category_preview_3"), value: 9 },
    { label: t("admin.dashboard.kpi.category_other"), value: 5 },
  ]), [t]);
  const hasCartCategoryData = categoryAddToCart.length > 0;
  const cartCategoryItems = hasCartCategoryData ? categoryAddToCart : cartPreview;
  const viewToPaid = React.useMemo(
    () => (metrics.views > 0 ? (orderStatus.paid_count / metrics.views) * 100 : 0),
    [metrics.views, orderStatus.paid_count]
  );
  const orderToPaid = React.useMemo(
    () => (metrics.orders > 0 ? (orderStatus.paid_count / metrics.orders) * 100 : 0),
    [metrics.orders, orderStatus.paid_count]
  );

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const items = React.useMemo<KpiCardData[]>(() => [
    {
      label: t("admin.dashboard.kpi.views"),
      value: numberFormatter.format(metrics.views),
      chips: [],
      details: [],
      extra: (
        <>
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>{t("admin.dashboard.kpi.category_breakdown")}</span>
            {!hasCategoryData ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.kpi.category_breakdown_preview")}
              </span>
            ) : null}
          </div>
          <CategoryBreakdown
            items={categoryItems}
            t={t}
            numberFormatter={numberFormatter}
            isPreview={!hasCategoryData}
          />
        </>
      ),
    },
    {
      label: t("admin.dashboard.kpi.add_to_cart"),
      value: numberFormatter.format(metrics.add_to_cart),
      chips: [],
      details: [],
      extra: (
        <>
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>{t("admin.dashboard.kpi.category_breakdown")}</span>
            {!hasCartCategoryData ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.kpi.category_breakdown_preview")}
              </span>
            ) : null}
          </div>
          <CategoryBreakdown
            items={cartCategoryItems}
            t={t}
            numberFormatter={numberFormatter}
            isPreview={!hasCartCategoryData}
          />
        </>
      ),
    },
    {
      label: t("admin.dashboard.kpi.orders"),
      value: numberFormatter.format(metrics.orders),
      chips: [
        {
          label: t("admin.dashboard.kpi.conversion_view_to_atc"),
          value: formatPercent(metrics.conversion_view_to_atc),
        },
        {
          label: t("admin.dashboard.tables.headers.cart_to_order"),
          value: formatPercent(cartToOrder),
        },
        {
          label: t("admin.dashboard.kpi.conversion_view_to_order"),
          value: formatPercent(metrics.conversion_view_to_order),
        },
      ],
      details: [
        {
          label: t("admin.dashboard.kpi.aov"),
          value: currencyFormatter.format(metrics.aov),
        },
        {
          label: t("admin.dashboard.kpi.units"),
          value: numberFormatter.format(metrics.units),
        },
      ],
    },
    {
      label: t("admin.dashboard.kpi.revenue"),
      value: currencyFormatter.format(orderStatus.paid_total),
      chips: [
        {
          label: t("admin.dashboard.kpi.conversion_view_to_paid"),
          value: formatPercent(viewToPaid),
        },
        {
          label: t("admin.dashboard.kpi.conversion_order_to_paid"),
          value: formatPercent(orderToPaid),
        },
      ],
      details: [
        {
          label: t("admin.dashboard.orders_widget.unpaid_total"),
          value: currencyFormatter.format(orderStatus.unpaid_total),
        },
        {
          label: t("admin.dashboard.kpi.paid_orders"),
          value: numberFormatter.format(orderStatus.paid_count),
        },
        {
          label: t("admin.dashboard.kpi.unpaid_orders"),
          value: numberFormatter.format(orderStatus.unpaid_count),
        },
      ],
    },
  ], [
    cartToOrder,
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
    orderStatus.paid_count,
    orderStatus.paid_total,
    orderStatus.unpaid_count,
    orderStatus.unpaid_total,
    categoryItems,
    categoryPreview,
    hasCategoryData,
    cartCategoryItems,
    cartPreview,
    hasCartCategoryData,
    t,
    viewToPaid,
    orderToPaid,
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
