import * as React from "react"

import { Link, router, usePage } from '@inertiajs/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLang } from "@/lib/lang"
import type { PageProps } from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout.tsx';

type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
  units: number;
};

type InterestPoint = {
  date: string;
  views: number;
  clicks: number;
  add_to_cart: number;
};

type DashboardMetrics = {
  revenue: number;
  orders: number;
  aov: number;
  units: number;
  views: number;
  add_to_cart: number;
  conversion_view_to_atc: number;
  conversion_view_to_order: number;
};

type TopProduct = {
  product_id: number;
  title: string;
  category: string | null;
  image_url?: string | null;
  revenue: number;
  orders: number;
  units: number;
  views: number;
  add_to_cart: number;
  conversion: number;
};

type InterestGap = {
  product_id: number;
  title: string;
  category: string | null;
  image_url?: string | null;
  views: number;
  add_to_cart?: number;
  orders: number;
  revenue?: number;
  conversion?: number;
};

type TopConversionPage = {
  data: InterestGap[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
    sort: 'view_to_cart' | 'view_to_order' | 'cart_to_order';
    direction: 'asc' | 'desc';
  };
};

type OrderStatusWidget = {
  health: number | null;
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
    key: 'pending' | 'processing' | 'unpaid';
    count: number;
    days: number;
  }[];
};

type DashboardPageProps = {
  range: number;
  table_mode?: 'top' | 'gap';
  metrics: DashboardMetrics;
  series: {
    sales: SalesPoint[];
    interest: InterestPoint[];
  };
  order_status: OrderStatusWidget;
  top_products: TopProduct[];
  top_conversion: TopConversionPage;
  meta: {
    start_date: string;
    end_date: string;
    currency: string;
  };
  error?: string;
};

type TopSortKey = 'views' | 'add_to_cart' | 'orders' | 'revenue';
type GapSortKey = 'view_to_cart' | 'view_to_order' | 'cart_to_order';

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

function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono font-medium tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onChange,
}: {
  label: string;
  sortKey: string;
  activeKey: string | null;
  direction: 'asc' | 'desc';
  onChange: (key: string) => void;
}) {
  const isActive = sortKey === activeKey;
  const Icon = !isActive
    ? ArrowUpDownIcon
    : direction === 'asc'
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-full justify-end px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={() => onChange(sortKey)}
    >
      <span>{label}</span>
      <Icon className="ml-1 h-3 w-3" />
    </Button>
  );
}

function ProductCell({
  title,
  category,
  imageUrl,
  fallback,
  href,
}: {
  title: string;
  category: string | null;
  imageUrl?: string | null;
  fallback: string;
  href?: string;
}) {
  const imageContent = imageUrl ? (
    <img
      src={imageUrl}
      alt={title}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  ) : (
    <span>—</span>
  );

  return (
    <div className="flex items-center gap-3">
      {href ? (
        <Link
          href={href}
          className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground"
          aria-label={title}
        >
          {imageContent}
        </Link>
      ) : (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
          {imageContent}
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">
          {category ?? fallback}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { range, table_mode, metrics, series, order_status, top_products, top_conversion, meta, error } =
    usePage<PageProps<DashboardPageProps>>().props;
  const { t, trans, locale } = useLang();
  const isMobile = useIsMobile();

  const uiLocale = locale === 'ru' ? 'ru-RU' : 'en-US';

  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale, {
      style: "currency",
      currency: meta?.currency ?? "BYN",
      maximumFractionDigits: 2,
    }),
    [meta?.currency, uiLocale]
  );

  const numberFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale),
    [uiLocale]
  );

  const compactNumberFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale, { notation: "compact", maximumFractionDigits: 1 }),
    [uiLocale]
  );

  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(uiLocale, { month: "short", day: "numeric" }),
    [uiLocale]
  );

  const formatDate = (value: string) => {
    const safeValue = value.includes("T") ? value : `${value}T00:00:00`;
    return dateFormatter.format(new Date(safeValue));
  };

  const periodLabel = trans('admin.dashboard.period', {
    days: range,
    start: formatDate(meta.start_date),
    end: formatDate(meta.end_date),
  });

  const chartHeightClass = isMobile ? "h-[240px]" : "h-[320px]";

  const [chartMode, setChartMode] = React.useState<"sales" | "interest">("sales");
  const [tableMode, setTableMode] = React.useState<"top" | "gap">(table_mode ?? "top");
  const [topSortKey, setTopSortKey] = React.useState<TopSortKey>("revenue");
  const [topSortDirection, setTopSortDirection] = React.useState<'asc' | 'desc'>("desc");
  const [topPage, setTopPage] = React.useState(1);
  const [isGapLoading, setIsGapLoading] = React.useState(false);
  const [cachedGapRows, setCachedGapRows] = React.useState<InterestGap[]>(top_conversion.data ?? []);

  React.useEffect(() => {
    setTableMode(table_mode ?? "top");
  }, [table_mode]);

  React.useEffect(() => {
    if (table_mode === 'gap') {
      setCachedGapRows(top_conversion.data ?? []);
      setIsGapLoading(false);
    }
  }, [table_mode, top_conversion.data]);

  const salesChartConfig: ChartConfig = {
    revenue: {
      label: t('admin.dashboard.tooltip.revenue'),
      color: "#7C3AED",
    },
    orders: {
      label: t('admin.dashboard.tooltip.orders'),
      color: "#F97316",
    },
  };

  const interestChartConfig: ChartConfig = {
    views: {
      label: t('admin.dashboard.tooltip.views'),
      color: "#2563EB",
    },
    clicks: {
      label: t('admin.dashboard.tooltip.clicks'),
      color: "#F59E0B",
    },
    add_to_cart: {
      label: t('admin.dashboard.tooltip.add_to_cart'),
      color: "#10B981",
    },
  };

  const kpis = [
    {
      label: t('admin.dashboard.kpi.revenue'),
      value: currencyFormatter.format(metrics.revenue),
    },
    {
      label: t('admin.dashboard.kpi.orders'),
      value: numberFormatter.format(metrics.orders),
    },
    {
      label: t('admin.dashboard.kpi.aov'),
      value: currencyFormatter.format(metrics.aov),
    },
    {
      label: t('admin.dashboard.kpi.units'),
      value: numberFormatter.format(metrics.units),
    },
    {
      label: t('admin.dashboard.kpi.views'),
      value: numberFormatter.format(metrics.views),
    },
    {
      label: t('admin.dashboard.kpi.add_to_cart'),
      value: numberFormatter.format(metrics.add_to_cart),
    },
    {
      label: t('admin.dashboard.kpi.conversion_view_to_atc'),
      value: `${metrics.conversion_view_to_atc.toFixed(1)}%`,
    },
    {
      label: t('admin.dashboard.kpi.conversion_view_to_order'),
      value: `${metrics.conversion_view_to_order.toFixed(1)}%`,
    },
  ];

  const statusMeta = [
    { key: 'pending', color: '#F59E0B', label: t('admin.orders_table.status.pending') },
    { key: 'confirmed', color: '#3B82F6', label: t('admin.orders_table.status.confirmed') },
    { key: 'processing', color: '#A855F7', label: t('admin.orders_table.status.processing') },
    { key: 'completed', color: '#10B981', label: t('admin.orders_table.status.completed') },
    { key: 'cancelled', color: '#EF4444', label: t('admin.orders_table.status.cancelled') },
    { key: 'archived', color: '#94A3B8', label: t('admin.orders_table.status.archived') },
  ] as const;

  const statusSegments = statusMeta
    .map((item) => ({
      ...item,
      count: order_status.status_counts[item.key] ?? 0,
    }))
    .filter((item) => item.count > 0);

  const statusTotal = order_status.status_total;
  const healthValue = order_status.health;
  const healthDisplay = healthValue === null ? '—' : `${Math.round(healthValue)}%`;
  const healthColor = healthValue === null
    ? '#94A3B8'
    : healthValue >= 80
      ? '#10B981'
      : healthValue >= 60
        ? '#F59E0B'
        : '#EF4444';
  const healthDegrees = healthValue === null ? 0 : (healthValue / 100) * 360;
  const healthBackground = healthValue === null
    ? 'conic-gradient(#e2e8f0 0deg, #e2e8f0 360deg)'
    : `conic-gradient(${healthColor} 0deg ${healthDegrees}deg, rgba(148, 163, 184, 0.25) ${healthDegrees}deg 360deg)`;

  const dashboardOnly = [
    'range',
    'table_mode',
    'metrics',
    'series',
    'top_products',
    'top_conversion',
    'order_status',
    'meta',
    'error',
  ];

  const handleRangeChange = (value: string) => {
    if (!value || value === String(range)) {
      return;
    }

    if (tableMode === 'gap') {
      setIsGapLoading(true);
    }

    router.get(
      route('admin.dashboard', {
        range: value,
        table: tableMode,
        conv_sort: top_conversion.pagination.sort,
        conv_dir: top_conversion.pagination.direction,
        conv_page: tableMode === 'gap' ? 1 : top_conversion.pagination.page,
      }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: dashboardOnly,
      }
    );
  };

  const handleChartModeChange = (value: string) => {
    if (!value || value === chartMode) {
      return;
    }

    if (value === "sales" || value === "interest") {
      setChartMode(value);
    }
  };

  const handleTableModeChange = (value: string) => {
    if (!value || value === tableMode) {
      return;
    }

    if (value === "top" || value === "gap") {
      setTableMode(value);
      setTopPage(1);
      if (value === "top") {
        setTopSortKey("revenue");
        setTopSortDirection("desc");
      }
      setIsGapLoading(value === 'gap');

      router.get(
        route('admin.dashboard', {
          range,
          table: value,
          conv_sort: top_conversion?.pagination?.sort ?? 'view_to_order',
          conv_dir: top_conversion?.pagination?.direction ?? 'desc',
          conv_page: 1,
        }),
        {},
        {
          preserveState: true,
          preserveScroll: true,
          only: value === 'gap' ? ['table_mode', 'top_conversion'] : ['table_mode'],
        }
      );
    }
  };

  const chartTitle = chartMode === "sales"
    ? t('admin.dashboard.charts.sales_title')
    : t('admin.dashboard.charts.interest_title');
  const chartDescription = chartMode === "sales"
    ? t('admin.dashboard.charts.sales_description')
    : t('admin.dashboard.charts.interest_description');

  const tableTitle = tableMode === "top"
    ? t('admin.dashboard.tables.top_title')
    : t('admin.dashboard.tables.gap_title');
  const tableDescription = tableMode === "top"
    ? t('admin.dashboard.tables.top_description')
    : t('admin.dashboard.tables.gap_description');

  const getIndicatorColor = (item: unknown, fallback = "#94a3b8") => {
    if (item && typeof item === "object") {
      const typed = item as { color?: string; stroke?: string; fill?: string };
      return typed.color || typed.stroke || typed.fill || fallback;
    }
    return fallback;
  };

  const formatSalesTooltip = (
    value: number | string,
    name: string,
    item: unknown,
  ) => {
    const numeric = Number(value);
    const label = name === "revenue"
      ? t('admin.dashboard.tooltip.revenue')
      : t('admin.dashboard.tooltip.orders');
    const display = name === "revenue"
      ? currencyFormatter.format(numeric)
      : numberFormatter.format(numeric);
    const color = getIndicatorColor(item);

    return <TooltipRow label={label} value={display} color={color} />;
  };

  const formatInterestTooltip = (
    value: number | string,
    name: string,
    item: unknown,
  ) => {
    const numeric = Number(value);
    const labelMap: Record<string, string> = {
      views: t('admin.dashboard.tooltip.views'),
      clicks: t('admin.dashboard.tooltip.clicks'),
      add_to_cart: t('admin.dashboard.tooltip.add_to_cart'),
    };
    const label = labelMap[name] ?? name;
    const display = numberFormatter.format(numeric);
    const color = getIndicatorColor(item);

    return <TooltipRow label={label} value={display} color={color} />;
  };

  const handleTopSortChange = (key: TopSortKey) => {
    if (key === topSortKey) {
      setTopSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTopSortKey(key);
      setTopSortDirection('desc');
    }
    setTopPage(1);
  };

  const handleGapSortChange = (key: GapSortKey) => {
    const currentDirection = top_conversion.pagination.direction;
    const nextDirection = key === top_conversion.pagination.sort
      ? (currentDirection === 'asc' ? 'desc' : 'asc')
      : 'desc';

    setIsGapLoading(true);
    router.get(
      route('admin.dashboard', {
        range,
        table: 'gap',
        conv_sort: key,
        conv_dir: nextDirection,
        conv_page: 1,
      }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['table_mode', 'top_conversion'],
      }
    );
  };

  const getConversionValue = (
    row: TopProduct | InterestGap,
    key: GapSortKey,
  ) => {
    const views = row.views ?? 0;
    const addToCart = row.add_to_cart ?? 0;
    const orders = row.orders ?? 0;

    if (key === 'view_to_cart') {
      return views > 0 ? (addToCart / views) * 100 : 0;
    }
    if (key === 'view_to_order') {
      return views > 0 ? (orders / views) * 100 : 0;
    }
    if (key === 'cart_to_order') {
      return addToCart > 0 ? (orders / addToCart) * 100 : 0;
    }
    return 0;
  };

  const formatPercent = (value: number | null) => {
    if (value === null || Number.isNaN(value)) {
      return "—";
    }
    return `${value.toFixed(1)}%`;
  };

  const sortedTopRows = React.useMemo(() => {
    return [...top_products].sort((a, b) => {
      const aValue = Number((a as Record<string, unknown>)[topSortKey] ?? 0);
      const bValue = Number((b as Record<string, unknown>)[topSortKey] ?? 0);
      if (aValue === bValue) {
        return 0;
      }
      return topSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [top_products, topSortKey, topSortDirection]);

  const pageSize = 10;
  const topTotalPages = Math.max(1, Math.ceil(sortedTopRows.length / pageSize));
  const topCurrentPage = Math.min(topPage, topTotalPages);
  const topPagedRows = React.useMemo(() => {
    const start = (topCurrentPage - 1) * pageSize;
    return sortedTopRows.slice(start, start + pageSize);
  }, [sortedTopRows, topCurrentPage]);

  React.useEffect(() => {
    if (topPage > topTotalPages) {
      setTopPage(topTotalPages);
    }
  }, [topPage, topTotalPages]);

  const gapRows = top_conversion.data ?? [];
  const gapPagination = top_conversion.pagination;
  const gapCurrentPage = gapPagination.page;
  const gapTotalPages = gapPagination.last_page;
  const displayGapRows = tableMode === "gap" && isGapLoading && cachedGapRows.length > 0
    ? cachedGapRows
    : gapRows;

  const isTableEmpty = tableMode === "top"
    ? sortedTopRows.length === 0
    : displayGapRows.length === 0;

  return (
    <AdminLayout title={t('admin.dashboard.title')}>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{t('admin.dashboard.title')}</h1>
            <p className="text-sm text-muted-foreground">{periodLabel}</p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(range)}
            onValueChange={handleRangeChange}
          >
            <ToggleGroupItem value="7">{trans('admin.dashboard.range_days', { days: 7 })}</ToggleGroupItem>
            <ToggleGroupItem value="30">{trans('admin.dashboard.range_days', { days: 30 })}</ToggleGroupItem>
            <ToggleGroupItem value="90">{trans('admin.dashboard.range_days', { days: 90 })}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{t('admin.dashboard.errors.title')}</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <KpiCard key={item.label} label={item.label} value={item.value} hint={periodLabel} />
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t('admin.dashboard.orders_widget.title')}</CardTitle>
              <CardDescription>{t('admin.dashboard.orders_widget.description')}</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={route('admin.orders')}>
                {t('admin.dashboard.orders_widget.cta')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="flex items-center gap-4">
                <div className="relative size-24">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: healthBackground }}
                  />
                  <div className="absolute inset-2 flex items-center justify-center rounded-full bg-background/90 text-lg font-semibold shadow-sm">
                    {healthDisplay}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('admin.dashboard.orders_widget.health_label')}</p>
                  <p className="text-xs text-muted-foreground">
                    {trans('admin.dashboard.orders_widget.active_total', {
                      count: numberFormatter.format(order_status.active_total),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trans('admin.dashboard.orders_widget.needs_attention', {
                      count: numberFormatter.format(order_status.needs_attention),
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
                    <span>{t('admin.dashboard.orders_widget.no_statuses')}</span>
                  ) : (
                    statusSegments.map((segment) => (
                      <div key={segment.key} className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span>{segment.label}</span>
                        <span className="font-medium text-foreground">
                          {numberFormatter.format(segment.count)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {order_status.attention.map((item) => (
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

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{chartTitle}</CardTitle>
              <CardDescription>{chartDescription}</CardDescription>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={chartMode}
              onValueChange={handleChartModeChange}
            >
              <ToggleGroupItem value="sales">{t('admin.dashboard.charts.toggle_sales')}</ToggleGroupItem>
              <ToggleGroupItem value="interest">{t('admin.dashboard.charts.toggle_interest')}</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            {chartMode === "sales" ? (
              <ChartContainer className={`${chartHeightClass} w-full`} config={salesChartConfig}>
                <ComposedChart
                  data={series.sales}
                  margin={{
                    top: 8,
                    right: isMobile ? 8 : 16,
                    left: isMobile ? 0 : 8,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillOrders" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 40 : 28}
                    tickMargin={isMobile ? 4 : 8}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => compactNumberFormatter.format(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 36 : 48}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => compactNumberFormatter.format(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 28 : 48}
                    hide={isMobile}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => formatDate(String(value))}
                        formatter={formatSalesTooltip}
                      />
                    }
                  />
                  <Area
                    yAxisId="left"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="url(#fillRevenue)"
                    strokeWidth={2.5}
                    type="monotone"
                    isAnimationActive={false}
                  />
                  <Area
                    yAxisId="right"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    fill="url(#fillOrders)"
                    strokeWidth={2.5}
                    type="monotone"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <ChartContainer className={`${chartHeightClass} w-full`} config={interestChartConfig}>
                <AreaChart
                  data={series.interest}
                  margin={{
                    top: 8,
                    right: isMobile ? 8 : 16,
                    left: isMobile ? 0 : 8,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="fillViews" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillClicks" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillATC" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-add_to_cart)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-add_to_cart)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 40 : 28}
                    tickMargin={isMobile ? 4 : 8}
                  />
                  <YAxis
                    tickFormatter={(value) => compactNumberFormatter.format(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 36 : 48}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => formatDate(String(value))}
                        formatter={formatInterestTooltip}
                      />
                    }
                  />
                  <Area
                    dataKey="views"
                    stroke="var(--color-views)"
                    fill="url(#fillViews)"
                    strokeWidth={2.5}
                    type="monotone"
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    fill="url(#fillClicks)"
                    strokeWidth={2.5}
                    type="monotone"
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="add_to_cart"
                    stroke="var(--color-add_to_cart)"
                    fill="url(#fillATC)"
                    strokeWidth={2.5}
                    type="monotone"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{tableTitle}</CardTitle>
              <CardDescription>{tableDescription}</CardDescription>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={tableMode}
              onValueChange={handleTableModeChange}
            >
              <ToggleGroupItem value="top">{t('admin.dashboard.tables.toggle_top')}</ToggleGroupItem>
              <ToggleGroupItem value="gap">{t('admin.dashboard.tables.toggle_gap')}</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.dashboard.tables.headers.product')}</TableHead>
                  {tableMode === "top" ? (
                    <>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.views')}
                          sortKey="views"
                          activeKey={topSortKey}
                          direction={topSortDirection}
                          onChange={(key) => handleTopSortChange(key as TopSortKey)}
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.added_to_cart')}
                          sortKey="add_to_cart"
                          activeKey={topSortKey}
                          direction={topSortDirection}
                          onChange={(key) => handleTopSortChange(key as TopSortKey)}
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.ordered')}
                          sortKey="orders"
                          activeKey={topSortKey}
                          direction={topSortDirection}
                          onChange={(key) => handleTopSortChange(key as TopSortKey)}
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.revenue')}
                          sortKey="revenue"
                          activeKey={topSortKey}
                          direction={topSortDirection}
                          onChange={(key) => handleTopSortChange(key as TopSortKey)}
                        />
                      </TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.view_to_cart')}
                          sortKey="view_to_cart"
                          activeKey={gapPagination.sort}
                          direction={gapPagination.direction}
                          onChange={(key) => handleGapSortChange(key as GapSortKey)}
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.view_to_order')}
                          sortKey="view_to_order"
                          activeKey={gapPagination.sort}
                          direction={gapPagination.direction}
                          onChange={(key) => handleGapSortChange(key as GapSortKey)}
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          label={t('admin.dashboard.tables.headers.cart_to_order')}
                          sortKey="cart_to_order"
                          activeKey={gapPagination.sort}
                          direction={gapPagination.direction}
                          onChange={(key) => handleGapSortChange(key as GapSortKey)}
                        />
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTableEmpty ? (
                  <TableRow>
                    <TableCell colSpan={tableMode === "top" ? 5 : 4} className="text-center text-muted-foreground">
                      {t('admin.dashboard.tables.empty')}
                    </TableCell>
                  </TableRow>
                ) : (tableMode === "top" ? topPagedRows : displayGapRows).map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <ProductCell
                        title={product.title}
                        category={product.category}
                        imageUrl={product.image_url}
                        href={route('admin.products.edit', { product: product.product_id })}
                        fallback={t('admin.dashboard.labels.no_category')}
                      />
                    </TableCell>
                    {tableMode === "top" ? (
                      <>
                        <TableCell className="text-right">
                          {numberFormatter.format(product.views)}
                        </TableCell>
                        <TableCell className="text-right">
                          {numberFormatter.format(product.add_to_cart ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {numberFormatter.format(product.orders)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(product.revenue ?? 0)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-right">
                          {formatPercent(getConversionValue(product, 'view_to_cart'))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(getConversionValue(product, 'view_to_order'))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(getConversionValue(product, 'cart_to_order'))}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {trans('admin.dashboard.tables.pagination.page_of', {
                  page: tableMode === "top" ? topCurrentPage : gapCurrentPage,
                  pages: tableMode === "top" ? topTotalPages : gapTotalPages,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (tableMode === "top") {
                      setTopPage(1);
                      return;
                    }
                    setIsGapLoading(true);
                    router.get(route('admin.dashboard', {
                      range,
                      table: 'gap',
                      conv_sort: gapPagination.sort,
                      conv_dir: gapPagination.direction,
                      conv_page: 1,
                    }), {}, {
                      preserveState: true,
                      preserveScroll: true,
                      only: ['table_mode', 'top_conversion'],
                    });
                  }}
                  disabled={tableMode === "top" ? topCurrentPage === 1 : gapCurrentPage === 1}
                >
                  <ChevronsLeftIcon className="h-4 w-4" />
                  <span className="sr-only">{t('admin.dashboard.tables.pagination.first')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (tableMode === "top") {
                      setTopPage(Math.max(1, topCurrentPage - 1));
                      return;
                    }
                    setIsGapLoading(true);
                    router.get(route('admin.dashboard', {
                      range,
                      table: 'gap',
                      conv_sort: gapPagination.sort,
                      conv_dir: gapPagination.direction,
                      conv_page: Math.max(1, gapCurrentPage - 1),
                    }), {}, {
                      preserveState: true,
                      preserveScroll: true,
                      only: ['table_mode', 'top_conversion'],
                    });
                  }}
                  disabled={tableMode === "top" ? topCurrentPage === 1 : gapCurrentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="sr-only">{t('admin.dashboard.tables.pagination.previous')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (tableMode === "top") {
                      setTopPage(Math.min(topTotalPages, topCurrentPage + 1));
                      return;
                    }
                    setIsGapLoading(true);
                    router.get(route('admin.dashboard', {
                      range,
                      table: 'gap',
                      conv_sort: gapPagination.sort,
                      conv_dir: gapPagination.direction,
                      conv_page: Math.min(gapTotalPages, gapCurrentPage + 1),
                    }), {}, {
                      preserveState: true,
                      preserveScroll: true,
                      only: ['table_mode', 'top_conversion'],
                    });
                  }}
                  disabled={tableMode === "top" ? topCurrentPage === topTotalPages : gapCurrentPage === gapTotalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="sr-only">{t('admin.dashboard.tables.pagination.next')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (tableMode === "top") {
                      setTopPage(topTotalPages);
                      return;
                    }
                    setIsGapLoading(true);
                    router.get(route('admin.dashboard', {
                      range,
                      table: 'gap',
                      conv_sort: gapPagination.sort,
                      conv_dir: gapPagination.direction,
                      conv_page: gapTotalPages,
                    }), {}, {
                      preserveState: true,
                      preserveScroll: true,
                      only: ['table_mode', 'top_conversion'],
                    });
                  }}
                  disabled={tableMode === "top" ? topCurrentPage === topTotalPages : gapCurrentPage === gapTotalPages}
                >
                  <ChevronsRightIcon className="h-4 w-4" />
                  <span className="sr-only">{t('admin.dashboard.tables.pagination.last')}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground">
          {t('admin.dashboard.notes.tracking')}
        </div>

      </div>
    </AdminLayout>
  );
}
