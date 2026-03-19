<?php

namespace App\Services\Analytics;

use App\Enums\FinancialStatus;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductAnalyticsService
{
    private const CONVERSION_SORT_KEYS = ['view_to_cart', 'view_to_order', 'cart_to_order'];

    public function getInterestTotals(Carbon $start, Carbon $end, ?string $brandId): object
    {
        $cacheKey = sprintf(
            'analytics:interest_totals:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), fn () => $this->baseStatsQuery($start, $end, $brandId)->first());
    }

    public function getInterestDailySeries(array $dates, Carbon $start, Carbon $end, ?string $brandId): array
    {
        $cacheKey = sprintf(
            'analytics:interest_daily:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($dates, $start, $end, $brandId) {
        $daily = DB::table('product_statistics as ps')
            ->join('products as p', 'p.id', '=', 'ps.product_id')
            ->whereBetween('ps.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('p.brand_id', $brandId))
            ->groupBy(DB::raw('DATE(ps.created_at)'))
            ->orderBy('date')
            ->selectRaw('DATE(ps.created_at) as date')
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'view' THEN 1 ELSE 0 END), 0) as views")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'click' THEN 1 ELSE 0 END), 0) as clicks")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'add_to_cart' THEN 1 ELSE 0 END), 0) as add_to_cart")
            ->get()
            ->keyBy('date');

        return array_map(function ($date) use ($daily) {
            $row = $daily->get($date);

            return [
                'date' => $date,
                'views' => (int) ($row->views ?? 0),
                'clicks' => (int) ($row->clicks ?? 0),
                'add_to_cart' => (int) ($row->add_to_cart ?? 0),
            ];
        }, $dates);
        });
    }

    public function emptyInterestSeries(array $dates): array
    {
        return array_map(fn ($date) => [
            'date' => $date,
            'views' => 0,
            'clicks' => 0,
            'add_to_cart' => 0,
        ], $dates);
    }

    public function getTopProducts(Carbon $start, Carbon $end, ?string $brandId): array
    {
        $cacheKey = sprintf(
            'analytics:top_products:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($start, $end, $brandId) {
        $firstImageSub = $this->firstImageSubquery();

        $topProducts = DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'p.id', '=', 'oi.product_id')
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->leftJoinSub($firstImageSub, 'pi', 'pi.product_id', '=', 'p.id')
            ->leftJoin('images as i', 'i.id', '=', 'pi.image_id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', OrderStatus::excluded())
            ->where('o.financial_status', '!=', FinancialStatus::Refunded->value)
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->whereNotNull('oi.product_id')
            ->groupBy('oi.product_id', 'p.title', 'c.name', 'i.src')
            ->selectRaw('oi.product_id as product_id')
            ->selectRaw('p.title as title')
            ->selectRaw('c.name as category_name')
            ->selectRaw('i.src as image_src')
            ->selectRaw('COUNT(DISTINCT o.id) as orders_count')
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue')
            ->orderByDesc('revenue')
            ->limit(50)
            ->get();

        $productIds = $topProducts->pluck('product_id')->filter()->values();
        $stats = $this->getProductStats($start, $end, $productIds);

        return $topProducts->map(function ($row) use ($stats) {
            $stat = $stats->get($row->product_id);
            $views = (int) ($stat->views ?? 0);
            $addToCart = (int) ($stat->add_to_cart ?? 0);
            $orders = (int) $row->orders_count;
            $conversion = $views > 0 ? ($orders / $views) * 100 : 0;

            return [
                'product_id' => (int) $row->product_id,
                'title' => $row->title ?? '—',
                'category' => $row->category_name,
                'image_url' => $this->resolveImageUrl($row->image_src ?? null),
                'revenue' => (float) $row->revenue,
                'orders' => $orders,
                'units' => (int) $row->units_sold,
                'views' => $views,
                'add_to_cart' => $addToCart,
                'conversion' => $conversion,
            ];
        })
            ->filter(function (array $row) {
                return ($row['views'] ?? 0) > 0
                    || ($row['add_to_cart'] ?? 0) > 0
                    || ($row['orders'] ?? 0) > 0
                    || ($row['revenue'] ?? 0) > 0;
            })
            ->values()
            ->all();
        });
    }

    public function getConversionPage(
        Carbon $start,
        Carbon $end,
        ?string $brandId,
        string $sort,
        string $direction,
        int $page,
        int $perPage
    ): array {
        $normalizedSort = in_array($sort, self::CONVERSION_SORT_KEYS, true)
            ? $sort
            : 'view_to_order';
        $normalizedDirection = $direction === 'asc' ? 'asc' : 'desc';

        $cacheKey = sprintf(
            'analytics:top_conversion:%s:%s:%s:%s:%s:%d:%d',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString(),
            $normalizedSort,
            $normalizedDirection,
            $page,
            $perPage
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use (
            $brandId,
            $start,
            $end,
            $normalizedSort,
            $normalizedDirection,
            $page,
            $perPage
        ) {
            $statsSub = DB::table('product_statistics')
                ->whereBetween('created_at', [$start, $end])
                ->selectRaw('product_id')
                ->selectRaw("SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) as views")
                ->selectRaw("SUM(CASE WHEN type = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_cart")
                ->groupBy('product_id');

            $salesSub = $this->salesSubquery($start, $end, $brandId);
            $firstImageSub = $this->firstImageSubquery();

            $conversionViewToCart = "CASE WHEN COALESCE(ps.views, 0) > 0 "
                ."THEN (COALESCE(ps.add_to_cart, 0) * 100.0 / NULLIF(ps.views, 0)) "
                ."ELSE 0 END";
            $conversionViewToOrder = "CASE WHEN COALESCE(ps.views, 0) > 0 "
                ."THEN (COALESCE(os.orders, 0) * 100.0 / NULLIF(ps.views, 0)) "
                ."ELSE 0 END";
            $conversionCartToOrder = "CASE WHEN COALESCE(ps.add_to_cart, 0) > 0 "
                ."THEN (COALESCE(os.orders, 0) * 100.0 / NULLIF(ps.add_to_cart, 0)) "
                ."ELSE 0 END";

            $conversionStatsFilter = function ($query) use (
                $conversionViewToCart,
                $conversionViewToOrder,
                $conversionCartToOrder
            ) {
                $query->whereRaw(
                    "($conversionViewToCart) > 0 OR ($conversionViewToOrder) > 0 OR ($conversionCartToOrder) > 0"
                );
            };

            $total = DB::table('products as p')
                ->leftJoinSub($statsSub, 'ps', 'ps.product_id', '=', 'p.id')
                ->leftJoinSub($salesSub, 'os', 'os.product_id', '=', 'p.id')
                ->when($brandId, fn ($query) => $query->where('p.brand_id', $brandId))
                ->where($conversionStatsFilter)
                ->count('p.id');

            $lastPage = max(1, (int) ceil($total / $perPage));
            $currentPage = min(max(1, $page), $lastPage);
            $offset = ($currentPage - 1) * $perPage;

            $rows = DB::table('products as p')
                ->leftJoinSub($statsSub, 'ps', 'ps.product_id', '=', 'p.id')
                ->leftJoinSub($salesSub, 'os', 'os.product_id', '=', 'p.id')
                ->leftJoinSub($firstImageSub, 'pi', 'pi.product_id', '=', 'p.id')
                ->leftJoin('images as i', 'i.id', '=', 'pi.image_id')
                ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
                ->when($brandId, fn ($query) => $query->where('p.brand_id', $brandId))
                ->where($conversionStatsFilter)
                ->selectRaw('p.id as product_id')
                ->selectRaw('p.title as title')
                ->selectRaw('c.name as category_name')
                ->selectRaw('i.src as image_src')
                ->selectRaw('COALESCE(ps.views, 0) as views')
                ->selectRaw('COALESCE(ps.add_to_cart, 0) as add_to_cart')
                ->selectRaw('COALESCE(os.orders, 0) as orders')
                ->selectRaw('COALESCE(os.revenue, 0) as revenue')
                ->selectRaw("$conversionViewToCart as view_to_cart")
                ->selectRaw("$conversionViewToOrder as view_to_order")
                ->selectRaw("$conversionCartToOrder as cart_to_order")
                ->orderBy($normalizedSort, $normalizedDirection)
                ->orderBy('views', 'desc')
                ->orderBy('p.id', 'desc')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            $data = $rows->map(function ($row) {
                return [
                    'product_id' => (int) $row->product_id,
                    'title' => $row->title ?? '—',
                    'category' => $row->category_name,
                    'image_url' => $this->resolveImageUrl($row->image_src ?? null),
                    'views' => (int) $row->views,
                    'add_to_cart' => (int) $row->add_to_cart,
                    'orders' => (int) $row->orders,
                    'revenue' => (float) $row->revenue,
                ];
            })->all();

            return [
                'data' => $data,
                'pagination' => [
                    'page' => $currentPage,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $lastPage,
                    'sort' => $normalizedSort,
                    'direction' => $normalizedDirection,
                ],
            ];
        });
    }

    public function emptyConversionPage(
        string $sort,
        string $direction,
        int $page,
        int $perPage
    ): array {
        $normalizedSort = in_array($sort, self::CONVERSION_SORT_KEYS, true)
            ? $sort
            : 'view_to_order';
        $normalizedDirection = $direction === 'asc' ? 'asc' : 'desc';

        return [
            'data' => [],
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => 0,
                'last_page' => 1,
                'sort' => $normalizedSort,
                'direction' => $normalizedDirection,
            ],
        ];
    }

    private function baseStatsQuery(Carbon $start, Carbon $end, ?string $brandId)
    {
        return DB::table('product_statistics as ps')
            ->join('products as p', 'p.id', '=', 'ps.product_id')
            ->whereBetween('ps.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('p.brand_id', $brandId))
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'view' THEN 1 ELSE 0 END), 0) as views")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'click' THEN 1 ELSE 0 END), 0) as clicks")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'add_to_cart' THEN 1 ELSE 0 END), 0) as add_to_cart");
    }

    private function getProductStats(Carbon $start, Carbon $end, Collection $productIds): Collection
    {
        if ($productIds->isEmpty()) {
            return collect();
        }

        return DB::table('product_statistics')
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('product_id', $productIds)
            ->groupBy('product_id')
            ->selectRaw('product_id')
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END), 0) as views")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'add_to_cart' THEN 1 ELSE 0 END), 0) as add_to_cart")
            ->get()
            ->keyBy('product_id');
    }

    private function salesSubquery(Carbon $start, Carbon $end, ?string $brandId)
    {
        return DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', OrderStatus::excluded())
            ->where('o.financial_status', '!=', FinancialStatus::Refunded->value)
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->groupBy('oi.product_id')
            ->selectRaw('oi.product_id as product_id')
            ->selectRaw('COUNT(DISTINCT o.id) as orders')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue');
    }

    private function firstImageSubquery()
    {
        return DB::table('product_images')
            ->selectRaw('DISTINCT ON (product_id) product_id, image_id')
            ->orderBy('product_id')
            ->orderBy('position')
            ->orderBy('id');
    }

    private function resolveImageUrl(?string $src): ?string
    {
        if (! $src) {
            return null;
        }

        if (str_starts_with($src, 'http://') || str_starts_with($src, 'https://')) {
            return $src;
        }

        return Storage::disk('s3')->url($src);
    }
}
