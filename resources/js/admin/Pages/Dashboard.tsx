import * as React from "react"

import { router, usePage } from '@inertiajs/react';

import { BrandAccountBadge, type BrandAccount } from "@/components/dashboard/brand-account-badge"
import { DashboardCharts } from "@/components/dashboard/charts-panel"
import { DashboardKpiGrid } from "@/components/dashboard/kpi-grid"
import { OrdersStatusWidget ,type  OrderStatusWidget } from "@/components/dashboard/orders-status-widget"
import { DashboardProductsTable } from "@/components/dashboard/products-table"
import type { DashboardMetrics, InterestPoint, SalesPoint, TopConversionPage, TopProduct } from "@/components/dashboard/types"
import { useDashboardFormatters } from "@/components/dashboard/use-dashboard-formatters"
import { AdminOnboarding } from "@/components/onboarding/admin-onboarding"
import type { OnboardingState } from "@/components/onboarding/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLang } from "@/lib/lang"
import type { PageProps } from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout.tsx';

interface DashboardPageProps {
    range: number;
    onboarding?: OnboardingState | null;
    table_mode?: 'top' | 'gap';
    // false — бренд-мастер: аналитика продаж, корзины и заказов скрыта.
    sales_enabled?: boolean;
    // Мастер или бизнес — плашка над аналитикой (null у админа без бренда).
    brand_account?: BrandAccount | null;
    metrics: DashboardMetrics;
    series: {
        sales: SalesPoint[];
        interest: InterestPoint[];
    };
    order_status: OrderStatusWidget;
    category_views?: { label: string; value: number }[];
    category_add_to_cart?: { label: string; value: number }[];
    top_products: TopProduct[];
    top_conversion: TopConversionPage;
    meta: {
        start_date: string;
        end_date: string;
        currency: string;
    };
    error?: string;
}

const DASHBOARD_ONLY = [
    "range",
    "table_mode",
    "sales_enabled",
    "metrics",
    "series",
    "category_views",
    "category_add_to_cart",
    "top_products",
    "top_conversion",
    "order_status",
    "meta",
    "error",
] as const;

export default function Dashboard() {
    const {
        range,
        onboarding,
        table_mode: tableModeProp,
        sales_enabled: salesEnabled = true,
        brand_account: brandAccount,
        metrics,
        series,
        category_views: categoryViews,
        category_add_to_cart: categoryAddToCart,
        order_status: orderStatus,
        top_products: topProducts,
        top_conversion: topConversion,
        meta,
        error,
    } = usePage<PageProps<DashboardPageProps>>().props;
    const { t, trans, locale } = useLang();
    const isMobile = useIsMobile();

    const {
        numberFormatter,
        compactNumberFormatter,
        formatDate,
    } = useDashboardFormatters(locale);

    const periodLabel = trans('admin.dashboard.period', {
        days: range,
        start: formatDate(meta.start_date),
        end: formatDate(meta.end_date),
    });

    const chartHeightClass = isMobile ? "h-[240px]" : "h-[320px]";

    const [tableMode, setTableMode] = React.useState<"top" | "gap">(tableModeProp ?? "gap");

    React.useEffect(() => {
        setTableMode(tableModeProp ?? "gap");
    }, [tableModeProp]);

    const handleRangeChange = (value: string) => {
        if (!value || value === String(range)) {
            return;
        }

        router.get(
            route('admin.dashboard', {
                range: value,
                table: tableMode,
                conv_sort: topConversion.pagination.sort,
                conv_dir: topConversion.pagination.direction,
                conv_page: tableMode === 'gap' ? 1 : topConversion.pagination.page,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: DASHBOARD_ONLY,
            }
        );
    };

    return (
        <AdminLayout title={t('admin.dashboard.title')}>
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold">{t('admin.dashboard.title')}</h1>
                            {brandAccount ? <BrandAccountBadge account={brandAccount} t={t}/> : null}
                        </div>
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

                {onboarding ? <AdminOnboarding onboarding={onboarding}/> : null}

                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>{t('admin.dashboard.errors.title')}</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                ) : null}

                <DashboardKpiGrid
                    metrics={metrics}
                    orderStatus={orderStatus}
                    categoryViews={categoryViews}
                    categoryAddToCart={categoryAddToCart}
                    numberFormatter={numberFormatter}
                    t={t}
                    salesEnabled={salesEnabled}
                />

                {salesEnabled ? (
                    <OrdersStatusWidget
                        data={orderStatus}
                        numberFormatter={numberFormatter}
                        t={t}
                        trans={trans}
                        ordersHref={route('admin.orders')}
                    />
                ) : null}

                <DashboardCharts
                    sales={series.sales}
                    interest={series.interest}
                    heightClass={chartHeightClass}
                    isMobile={isMobile}
                    formatDate={formatDate}
                    formatCompact={(value) => compactNumberFormatter.format(value)}
                    formatNumber={(value) => numberFormatter.format(value)}
                    salesEnabled={salesEnabled}
                    labels={{
                        toggleSales: t('admin.dashboard.charts.toggle_sales'),
                        toggleInterest: t('admin.dashboard.charts.toggle_interest'),
                        salesTitle: t('admin.dashboard.charts.sales_title'),
                        salesDescription: t('admin.dashboard.charts.sales_description'),
                        interestTitle: t('admin.dashboard.charts.interest_title'),
                        interestDescription: t('admin.dashboard.charts.interest_description'),
                        interestDescriptionNoSales: t('admin.dashboard.charts.interest_description_no_sales'),
                        revenue: t('admin.dashboard.tooltip.revenue'),
                        orders: t('admin.dashboard.tooltip.orders'),
                        views: t('admin.dashboard.tooltip.views'),
                        clicks: t('admin.dashboard.tooltip.clicks'),
                        addToCart: t('admin.dashboard.tooltip.add_to_cart'),
                    }}
                />

                {/* Топ и конверсии считаются по заказам и корзине — у мастера их нет. */}
                {salesEnabled ? (
                    <DashboardProductsTable
                        range={range}
                        tableMode={tableMode}
                        onTableModeChange={setTableMode}
                        topProducts={topProducts}
                        topConversion={topConversion}
                        numberFormatter={numberFormatter}
                        t={t}
                        trans={trans}
                    />
                ) : null}

            </div>
        </AdminLayout>
    );
}
