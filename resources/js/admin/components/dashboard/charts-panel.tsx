import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ChartConfig } from "@/components/ui/chart"

import { InterestChart, SalesChart } from "./charts"
import type { InterestPoint, SalesPoint } from "./types"

type TooltipFormatter = (value: number | string, name: string, item: unknown) => React.ReactNode

type DashboardChartsProps = {
  sales: SalesPoint[];
  interest: InterestPoint[];
  heightClass: string;
  isMobile: boolean;
  formatDate: (value: string) => string;
  formatCompact: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  labels: {
    toggleSales: string;
    toggleInterest: string;
    salesTitle: string;
    salesDescription: string;
    interestTitle: string;
    interestDescription: string;
    revenue: string;
    orders: string;
    views: string;
    clicks: string;
    addToCart: string;
  };
};

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

const getIndicatorColor = (item: unknown, fallback = "#94a3b8") => {
  if (item && typeof item === "object") {
    const typed = item as { color?: string; stroke?: string; fill?: string };
    return typed.color || typed.stroke || typed.fill || fallback;
  }
  return fallback;
};

export function DashboardCharts({
  sales,
  interest,
  heightClass,
  isMobile,
  formatDate,
  formatCompact,
  formatCurrency,
  formatNumber,
  labels,
}: DashboardChartsProps) {
  const [mode, setMode] = React.useState<"sales" | "interest">("sales");

  const salesConfig: ChartConfig = React.useMemo(() => ({
    revenue: {
      label: labels.revenue,
      color: "#7C3AED",
    },
    orders: {
      label: labels.orders,
      color: "#F97316",
    },
  }), [labels]);

  const interestConfig: ChartConfig = React.useMemo(() => ({
    views: {
      label: labels.views,
      color: "#2563EB",
    },
    clicks: {
      label: labels.clicks,
      color: "#F59E0B",
    },
    add_to_cart: {
      label: labels.addToCart,
      color: "#10B981",
    },
  }), [labels]);

  const formatSalesTooltip: TooltipFormatter = (value, name, item) => {
    const numeric = Number(value);
    const label = name === "revenue" ? labels.revenue : labels.orders;
    const display = name === "revenue"
      ? formatCurrency(numeric)
      : formatNumber(numeric);
    const color = getIndicatorColor(item);

    return <TooltipRow label={label} value={display} color={color} />;
  };

  const formatInterestTooltip: TooltipFormatter = (value, name, item) => {
    const numeric = Number(value);
    const labelMap: Record<string, string> = {
      views: labels.views,
      clicks: labels.clicks,
      add_to_cart: labels.addToCart,
    };
    const label = labelMap[name] ?? name;
    const display = formatNumber(numeric);
    const color = getIndicatorColor(item);

    return <TooltipRow label={label} value={display} color={color} />;
  };

  const handleModeChange = (value: string) => {
    if (value === "sales" || value === "interest") {
      setMode(value);
    }
  };

  const title = mode === "sales" ? labels.salesTitle : labels.interestTitle;
  const description = mode === "sales" ? labels.salesDescription : labels.interestDescription;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={handleModeChange}
        >
          <ToggleGroupItem value="sales">{labels.toggleSales}</ToggleGroupItem>
          <ToggleGroupItem value="interest">{labels.toggleInterest}</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {mode === "sales" ? (
          <SalesChart
            data={sales}
            config={salesConfig}
            heightClass={heightClass}
            isMobile={isMobile}
            formatDate={formatDate}
            formatCompact={formatCompact}
            tooltipFormatter={formatSalesTooltip}
          />
        ) : (
          <InterestChart
            data={interest}
            config={interestConfig}
            heightClass={heightClass}
            isMobile={isMobile}
            formatDate={formatDate}
            formatCompact={formatCompact}
            tooltipFormatter={formatInterestTooltip}
          />
        )}
      </CardContent>
    </Card>
  );
}
