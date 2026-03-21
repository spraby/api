<?php

namespace App\Services\Analytics;

use App\Enums\FinancialStatus;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesAnalyticsService
{
    use CachesAnalytics;

    public static function buildDateRange(Carbon $start, Carbon $end): array
    {
        $dates = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dates[] = $cursor->toDateString();
            $cursor->addDay();
        }

        return $dates;
    }

    public function getTotals(Carbon $start, Carbon $end, ?string $brandId): object
    {
        $cacheKey = sprintf(
            'analytics:sales_totals:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return $this->cached($cacheKey, fn () => DB::table('orders as o')
            ->join('order_items as oi', 'oi.order_id', '=', 'o.id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', OrderStatus::excluded())
            ->where('o.financial_status', '!=', FinancialStatus::Refunded->value)
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->selectRaw('COUNT(DISTINCT o.id) as orders_count')
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue')
            ->first());
    }

    public function getDailySeries(array $dates, Carbon $start, Carbon $end, ?string $brandId): array
    {
        $cacheKey = sprintf(
            'analytics:sales_daily:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return $this->cached($cacheKey, function () use ($dates, $start, $end, $brandId) {
        $daily = DB::table('orders as o')
            ->leftJoin('order_items as oi', 'oi.order_id', '=', 'o.id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', OrderStatus::excluded())
            ->where('o.financial_status', '!=', FinancialStatus::Refunded->value)
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->groupBy(DB::raw('DATE(o.created_at)'))
            ->orderBy('date')
            ->selectRaw('DATE(o.created_at) as date')
            ->selectRaw('COUNT(DISTINCT o.id) as orders')
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue')
            ->get()
            ->keyBy('date');

        return array_map(function ($date) use ($daily) {
            $row = $daily->get($date);

            return [
                'date' => $date,
                'revenue' => (float) ($row->revenue ?? 0),
                'orders' => (int) ($row->orders ?? 0),
                'units' => (int) ($row->units ?? 0),
            ];
        }, $dates);
        });
    }

    public function emptySeries(array $dates): array
    {
        return array_map(fn ($date) => [
            'date' => $date,
            'revenue' => 0,
            'orders' => 0,
            'units' => 0,
        ], $dates);
    }

    public function buildMetrics(object $salesTotals, object $interestTotals): array
    {
        $ordersCount = (int) ($salesTotals->orders_count ?? 0);
        $revenue = (float) ($salesTotals->revenue ?? 0);
        $unitsSold = (int) ($salesTotals->units_sold ?? 0);
        $views = (int) ($interestTotals->views ?? 0);
        $addToCart = (int) ($interestTotals->add_to_cart ?? 0);

        return [
            'revenue' => $revenue,
            'orders' => $ordersCount,
            'aov' => $ordersCount > 0 ? $revenue / $ordersCount : 0,
            'units' => $unitsSold,
            'views' => $views,
            'add_to_cart' => $addToCart,
            'conversion_view_to_atc' => $views > 0 ? ($addToCart / $views) * 100 : 0,
            'conversion_view_to_order' => $views > 0 ? ($ordersCount / $views) * 100 : 0,
        ];
    }

    public function emptyMetrics(): array
    {
        return [
            'revenue' => 0,
            'orders' => 0,
            'aov' => 0,
            'units' => 0,
            'views' => 0,
            'add_to_cart' => 0,
            'conversion_view_to_atc' => 0,
            'conversion_view_to_order' => 0,
        ];
    }
}
