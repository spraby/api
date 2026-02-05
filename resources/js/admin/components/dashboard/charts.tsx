import * as React from "react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type TooltipFormatter = (value: number | string, name: string, item: unknown) => React.ReactNode

type BaseChartProps = {
  heightClass: string;
  isMobile: boolean;
  formatDate: (value: string) => string;
  formatCompact: (value: number) => string;
};

type SalesChartProps = BaseChartProps & {
  data: Array<{ date: string; revenue: number; orders: number }>;
  config: ChartConfig;
  tooltipFormatter: TooltipFormatter;
};

type InterestChartProps = BaseChartProps & {
  data: Array<{ date: string; views: number; clicks: number; add_to_cart: number }>;
  config: ChartConfig;
  tooltipFormatter: TooltipFormatter;
};

const getMargin = (isMobile: boolean) => ({
  top: 8,
  right: isMobile ? 8 : 16,
  left: isMobile ? 0 : 8,
  bottom: 0,
});

const getXAxisProps = (formatDate: (value: string) => string, isMobile: boolean) => ({
  dataKey: "date",
  tickFormatter: formatDate,
  tickLine: false,
  axisLine: false,
  minTickGap: isMobile ? 40 : 28,
  tickMargin: isMobile ? 4 : 8,
});

const getYAxisProps = (formatCompact: (value: number) => string, isMobile: boolean) => ({
  tickFormatter: (value: number | string) => formatCompact(Number(value)),
  tickLine: false,
  axisLine: false,
  width: isMobile ? 36 : 48,
});

const getRightAxisProps = (formatCompact: (value: number) => string, isMobile: boolean) => ({
  ...getYAxisProps(formatCompact, isMobile),
  orientation: "right" as const,
  width: isMobile ? 28 : 48,
  hide: isMobile,
});

const buildTooltipContent = (
  formatDate: (value: string) => string,
  tooltipFormatter: TooltipFormatter,
) => (
  <ChartTooltipContent
    labelFormatter={(value) => formatDate(String(value))}
    formatter={tooltipFormatter}
  />
);

export function SalesChart({
  data,
  config,
  heightClass,
  isMobile,
  formatDate,
  formatCompact,
  tooltipFormatter,
}: SalesChartProps) {
  const margin = React.useMemo(() => getMargin(isMobile), [isMobile])
  const xAxisProps = React.useMemo(() => getXAxisProps(formatDate, isMobile), [formatDate, isMobile])
  const leftAxisProps = React.useMemo(() => getYAxisProps(formatCompact, isMobile), [formatCompact, isMobile])
  const rightAxisProps = React.useMemo(() => getRightAxisProps(formatCompact, isMobile), [formatCompact, isMobile])

  return (
    <ChartContainer className={`${heightClass} w-full`} config={config}>
      <ComposedChart data={data} margin={margin}>
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
        <XAxis {...xAxisProps} />
        <YAxis yAxisId="left" {...leftAxisProps} />
        <YAxis yAxisId="right" {...rightAxisProps} />
        <ChartTooltip cursor={false} content={buildTooltipContent(formatDate, tooltipFormatter)} />
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
  )
}

export function InterestChart({
  data,
  config,
  heightClass,
  isMobile,
  formatDate,
  formatCompact,
  tooltipFormatter,
}: InterestChartProps) {
  const margin = React.useMemo(() => getMargin(isMobile), [isMobile])
  const xAxisProps = React.useMemo(() => getXAxisProps(formatDate, isMobile), [formatDate, isMobile])
  const leftAxisProps = React.useMemo(() => getYAxisProps(formatCompact, isMobile), [formatCompact, isMobile])

  return (
    <ChartContainer className={`${heightClass} w-full`} config={config}>
      <AreaChart data={data} margin={margin}>
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
        <XAxis {...xAxisProps} />
        <YAxis {...leftAxisProps} />
        <ChartTooltip cursor={false} content={buildTooltipContent(formatDate, tooltipFormatter)} />
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
  )
}
