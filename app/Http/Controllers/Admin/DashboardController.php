<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const RANGE_OPTIONS = [7, 30, 90];
    private const EXCLUDED_STATUSES = ['cancelled', 'archived'];
    private const CONVERSION_SORT_KEYS = ['view_to_cart', 'view_to_order', 'cart_to_order'];
    private const PENDING_STALE_DAYS = 2;
    private const PROCESSING_STALE_DAYS = 5;
    private const UNPAID_STALE_DAYS = 3;

    public function index(Request $request): Response
    {
        $range = (int) $request->query('range', 30);
        if (! in_array($range, self::RANGE_OPTIONS, true)) {
            $range = 30;
        }

        $tableMode = $request->query('table', 'top');
        if (! in_array($tableMode, ['top', 'gap'], true)) {
            $tableMode = 'top';
        }

        $conversionSort = (string) $request->query('conv_sort', 'view_to_order');
        $conversionDirection = (string) $request->query('conv_dir', 'desc');
        $conversionPage = max(1, (int) $request->query('conv_page', 1));
        $conversionPerPage = 10;

        /**
         * @var User|null $user
         * @var Brand|null $brand
         */
        $user = auth()->user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->isAdmin() ?? false;

        $start = now()->subDays($range - 1)->startOfDay();
        $end = now()->endOfDay();
        $dates = $this->buildDateRange($start, $end);

        if (! $brand && ! $isAdmin) {
            return Inertia::render('Dashboard', [
                'range' => $range,
                'table_mode' => $tableMode,
                'metrics' => $this->emptyMetrics(),
                'series' => [
                    'sales' => $this->emptySalesSeries($dates),
                    'interest' => $this->emptyInterestSeries($dates),
                ],
                'order_status' => $this->emptyOrderStatusWidget(),
                'top_products' => [],
                'top_conversion' => $this->emptyTopConversion(
                    $conversionSort,
                    $conversionDirection,
                    $conversionPage,
                    $conversionPerPage
                ),
                'meta' => [
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                    'currency' => 'BYN',
                ],
                'error' => __('admin.dashboard.errors.no_brand'),
            ]);
        }

        $brandId = $brand?->id;

        $salesTotals = $this->getSalesTotals($start, $end, $brandId);
        $salesDaily = $this->getSalesDaily($start, $end, $brandId);
        $interestTotals = $this->getInterestTotals($start, $end, $brandId);
        $interestDaily = $this->getInterestDaily($start, $end, $brandId);
        $orderStatus = $this->getOrderStatusWidget($start, $end, $brandId);

        $salesSeries = $this->mergeSalesSeries($dates, $salesDaily);
        $interestSeries = $this->mergeInterestSeries($dates, $interestDaily);

        $ordersCount = (int) ($salesTotals->orders_count ?? 0);
        $revenue = (float) ($salesTotals->revenue ?? 0);
        $unitsSold = (int) ($salesTotals->units_sold ?? 0);
        $views = (int) ($interestTotals->views ?? 0);
        $addToCart = (int) ($interestTotals->add_to_cart ?? 0);

        $metrics = [
            'revenue' => $revenue,
            'orders' => $ordersCount,
            'aov' => $ordersCount > 0 ? $revenue / $ordersCount : 0,
            'units' => $unitsSold,
            'views' => $views,
            'add_to_cart' => $addToCart,
            'conversion_view_to_atc' => $views > 0 ? ($addToCart / $views) * 100 : 0,
            'conversion_view_to_order' => $views > 0 ? ($ordersCount / $views) * 100 : 0,
        ];

        $topProducts = $this->getTopProducts($start, $end, $brandId);
        $topConversion = $tableMode === 'gap'
            ? $this->getTopConversionPage(
                $start,
                $end,
                $brandId,
                $conversionSort,
                $conversionDirection,
                $conversionPage,
                $conversionPerPage
            )
            : $this->emptyTopConversion($conversionSort, $conversionDirection, $conversionPage, $conversionPerPage);

        return Inertia::render('Dashboard', [
            'range' => $range,
            'table_mode' => $tableMode,
            'metrics' => $metrics,
            'series' => [
                'sales' => $salesSeries,
                'interest' => $interestSeries,
            ],
            'order_status' => $orderStatus,
            'top_products' => $topProducts,
            'top_conversion' => $topConversion,
            'meta' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'currency' => 'BYN',
            ],
        ]);
    }

    private function buildDateRange(Carbon $start, Carbon $end): array
    {
        $dates = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dates[] = $cursor->toDateString();
            $cursor->addDay();
        }

        return $dates;
    }

    private function emptyMetrics(): array
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

    private function emptyTopConversion(
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

    private function emptySalesSeries(array $dates): array
    {
        return array_map(fn ($date) => [
            'date' => $date,
            'revenue' => 0,
            'orders' => 0,
            'units' => 0,
        ], $dates);
    }

    private function emptyInterestSeries(array $dates): array
    {
        return array_map(fn ($date) => [
            'date' => $date,
            'views' => 0,
            'clicks' => 0,
            'add_to_cart' => 0,
        ], $dates);
    }

    private function emptyOrderStatusWidget(): array
    {
        return [
            'health' => null,
            'active_total' => 0,
            'needs_attention' => 0,
            'status_total' => 0,
            'status_counts' => [
                'pending' => 0,
                'confirmed' => 0,
                'processing' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'archived' => 0,
            ],
            'attention' => [
                [
                    'key' => 'pending',
                    'count' => 0,
                    'days' => self::PENDING_STALE_DAYS,
                ],
                [
                    'key' => 'processing',
                    'count' => 0,
                    'days' => self::PROCESSING_STALE_DAYS,
                ],
                [
                    'key' => 'unpaid',
                    'count' => 0,
                    'days' => self::UNPAID_STALE_DAYS,
                ],
            ],
        ];
    }

    private function getOrderStatusWidget(Carbon $start, Carbon $end, ?string $brandId): array
    {
        $cacheKey = sprintf(
            'dashboard:order_status:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($start, $end, $brandId) {
            $statusCounts = [
                'pending' => 0,
                'confirmed' => 0,
                'processing' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'archived' => 0,
            ];

            $statusRows = DB::table('orders as o')
                ->whereBetween('o.created_at', [$start, $end])
                ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
                ->selectRaw('o.status as status')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('o.status')
                ->get();

            foreach ($statusRows as $row) {
                if (array_key_exists($row->status, $statusCounts)) {
                    $statusCounts[$row->status] = (int) $row->total;
                }
            }

            $statusTotal = array_sum($statusCounts);

            $pendingThreshold = now()->subDays(self::PENDING_STALE_DAYS);
            $processingThreshold = now()->subDays(self::PROCESSING_STALE_DAYS);
            $unpaidThreshold = now()->subDays(self::UNPAID_STALE_DAYS);

            $summary = DB::table('orders as o')
                ->whereBetween('o.created_at', [$start, $end])
                ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
                ->whereNotIn('o.status', self::EXCLUDED_STATUSES)
                ->selectRaw('COUNT(*) as active_total')
                ->selectRaw(
                    "SUM(CASE WHEN o.status IN ('pending', 'confirmed') AND o.created_at <= ? THEN 1 ELSE 0 END) as pending_overdue",
                    [$pendingThreshold]
                )
                ->selectRaw(
                    "SUM(CASE WHEN o.status = 'processing' AND o.created_at <= ? THEN 1 ELSE 0 END) as processing_overdue",
                    [$processingThreshold]
                )
                ->selectRaw(
                    "SUM(CASE WHEN o.financial_status = 'unpaid' AND o.created_at <= ? THEN 1 ELSE 0 END) as unpaid_overdue",
                    [$unpaidThreshold]
                )
                ->selectRaw(
                    "SUM(CASE WHEN (
                        (o.status IN ('pending', 'confirmed') AND o.created_at <= ?)
                        OR (o.status = 'processing' AND o.created_at <= ?)
                        OR (o.financial_status = 'unpaid' AND o.created_at <= ?)
                    ) THEN 1 ELSE 0 END) as needs_attention",
                    [$pendingThreshold, $processingThreshold, $unpaidThreshold]
                )
                ->first();

            $activeTotal = (int) ($summary->active_total ?? 0);
            $needsAttention = (int) ($summary->needs_attention ?? 0);
            $health = $activeTotal > 0
                ? max(0, min(100, (1 - ($needsAttention / $activeTotal)) * 100))
                : null;

            return [
                'health' => $health,
                'active_total' => $activeTotal,
                'needs_attention' => $needsAttention,
                'status_total' => $statusTotal,
                'status_counts' => $statusCounts,
                'attention' => [
                    [
                        'key' => 'pending',
                        'count' => (int) ($summary->pending_overdue ?? 0),
                        'days' => self::PENDING_STALE_DAYS,
                    ],
                    [
                        'key' => 'processing',
                        'count' => (int) ($summary->processing_overdue ?? 0),
                        'days' => self::PROCESSING_STALE_DAYS,
                    ],
                    [
                        'key' => 'unpaid',
                        'count' => (int) ($summary->unpaid_overdue ?? 0),
                        'days' => self::UNPAID_STALE_DAYS,
                    ],
                ],
            ];
        });
    }

    private function getSalesTotals(Carbon $start, Carbon $end, ?string $brandId): object
    {
        return DB::table('orders as o')
            ->join('order_items as oi', 'oi.order_id', '=', 'o.id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', self::EXCLUDED_STATUSES)
            ->where('o.financial_status', '!=', 'refunded')
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->selectRaw('COUNT(DISTINCT o.id) as orders_count')
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue')
            ->first();
    }

    private function getSalesDaily(Carbon $start, Carbon $end, ?string $brandId): Collection
    {
        return DB::table('orders as o')
            ->leftJoin('order_items as oi', 'oi.order_id', '=', 'o.id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', self::EXCLUDED_STATUSES)
            ->where('o.financial_status', '!=', 'refunded')
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->groupBy(DB::raw('DATE(o.created_at)'))
            ->orderBy('date')
            ->selectRaw('DATE(o.created_at) as date')
            ->selectRaw('COUNT(DISTINCT o.id) as orders')
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units')
            ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue')
            ->get()
            ->keyBy('date');
    }

    private function getInterestTotals(Carbon $start, Carbon $end, ?string $brandId): object
    {
        return DB::table('product_statistics as ps')
            ->join('products as p', 'p.id', '=', 'ps.product_id')
            ->whereBetween('ps.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('p.brand_id', $brandId))
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'view' THEN 1 ELSE 0 END), 0) as views")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'click' THEN 1 ELSE 0 END), 0) as clicks")
            ->selectRaw("COALESCE(SUM(CASE WHEN ps.type = 'add_to_cart' THEN 1 ELSE 0 END), 0) as add_to_cart")
            ->first();
    }

    private function getInterestDaily(Carbon $start, Carbon $end, ?string $brandId): Collection
    {
        return DB::table('product_statistics as ps')
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
    }

    private function mergeSalesSeries(array $dates, Collection $daily): array
    {
        return array_map(function ($date) use ($daily) {
            $row = $daily->get($date);

            return [
                'date' => $date,
                'revenue' => (float) ($row->revenue ?? 0),
                'orders' => (int) ($row->orders ?? 0),
                'units' => (int) ($row->units ?? 0),
            ];
        }, $dates);
    }

    private function mergeInterestSeries(array $dates, Collection $daily): array
    {
        return array_map(function ($date) use ($daily) {
            $row = $daily->get($date);

            return [
                'date' => $date,
                'views' => (int) ($row->views ?? 0),
                'clicks' => (int) ($row->clicks ?? 0),
                'add_to_cart' => (int) ($row->add_to_cart ?? 0),
            ];
        }, $dates);
    }

    private function getTopProducts(Carbon $start, Carbon $end, ?string $brandId): array
    {
        $firstImageSub = $this->firstImageSubquery();

        $topProducts = DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'p.id', '=', 'oi.product_id')
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->leftJoinSub($firstImageSub, 'pi', 'pi.product_id', '=', 'p.id')
            ->leftJoin('images as i', 'i.id', '=', 'pi.image_id')
            ->whereBetween('o.created_at', [$start, $end])
            ->whereNotIn('o.status', self::EXCLUDED_STATUSES)
            ->where('o.financial_status', '!=', 'refunded')
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
    }

    private function getTopConversionPage(
        Carbon $start,
        Carbon $end,
        ?string $brandId,
        string $sort,
        string $direction,
        int $page,
        int $perPage
    ): array
    {
        $normalizedSort = in_array($sort, self::CONVERSION_SORT_KEYS, true)
            ? $sort
            : 'view_to_order';
        $normalizedDirection = $direction === 'asc' ? 'asc' : 'desc';

        $cacheKey = sprintf(
            'dashboard:top_conversion:%s:%s:%s:%s:%s:%d:%d',
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

            $salesSub = DB::table('order_items as oi')
                ->join('orders as o', 'o.id', '=', 'oi.order_id')
                ->whereBetween('o.created_at', [$start, $end])
                ->whereNotIn('o.status', self::EXCLUDED_STATUSES)
                ->where('o.financial_status', '!=', 'refunded')
                ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
                ->groupBy('oi.product_id')
                ->selectRaw('oi.product_id as product_id')
                ->selectRaw('COUNT(DISTINCT o.id) as orders')
                ->selectRaw('COALESCE(SUM(oi.final_price * oi.quantity), 0) as revenue');

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
