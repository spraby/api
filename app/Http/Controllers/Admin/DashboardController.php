<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DashboardRequest;
use App\Models\Brand;
use App\Models\User;
use App\Services\Analytics\OrderHealthService;
use App\Services\Analytics\ProductAnalyticsService;
use App\Services\Analytics\SalesAnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly SalesAnalyticsService $salesAnalytics,
        private readonly ProductAnalyticsService $productAnalytics,
        private readonly OrderHealthService $orderHealth,
    ) {}

    public function index(DashboardRequest $request): Response
    {
        $range = $request->range();
        $tableMode = $request->tableMode();
        $conversionSort = $request->conversionSort();
        $conversionDirection = $request->conversionDirection();
        $conversionPage = $request->conversionPage();
        $conversionPerPage = $request->conversionPerPage();

        /** @var User|null $user */
        $user = auth()->user();
        /** @var Brand|null $brand */
        $brand = $user?->getBrand();
        $isAdmin = $user?->isAdmin() ?? false;

        $start = now()->subDays($range - 1)->startOfDay();
        $end = now()->endOfDay();
        $dates = SalesAnalyticsService::buildDateRange($start, $end);
        $meta = [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'currency' => 'BYN',
        ];

        if (! $brand && ! $isAdmin) {
            return $this->emptyDashboard($range, $tableMode, $dates, $meta, $conversionSort, $conversionDirection, $conversionPage, $conversionPerPage);
        }

        $brandId = $brand?->id;

        $salesTotals = $this->salesAnalytics->getTotals($start, $end, $brandId);
        $interestTotals = $this->productAnalytics->getInterestTotals($start, $end, $brandId);

        return Inertia::render('Dashboard', [
            'range' => $range,
            'table_mode' => $tableMode,
            'metrics' => $this->salesAnalytics->buildMetrics($salesTotals, $interestTotals),
            'meta' => $meta,
            'series' => [
                'sales' => $this->salesAnalytics->getDailySeries($dates, $start, $end, $brandId),
                'interest' => $this->productAnalytics->getInterestDailySeries($dates, $start, $end, $brandId),
            ],
            'order_status' => $this->orderHealth->getHealthWidget($start, $end, $brandId),
            'top_products' => $this->productAnalytics->getTopProducts($start, $end, $brandId),
            'top_conversion' => $tableMode === 'gap'
                ? $this->productAnalytics->getConversionPage(
                    $start, $end, $brandId, $conversionSort, $conversionDirection, $conversionPage, $conversionPerPage
                )
                : $this->productAnalytics->emptyConversionPage(
                    $conversionSort, $conversionDirection, $conversionPage, $conversionPerPage
                ),
        ]);
    }

    private function emptyDashboard(
        int $range,
        string $tableMode,
        array $dates,
        array $meta,
        string $conversionSort,
        string $conversionDirection,
        int $conversionPage,
        int $conversionPerPage,
    ): Response {
        return Inertia::render('Dashboard', [
            'range' => $range,
            'table_mode' => $tableMode,
            'metrics' => $this->salesAnalytics->emptyMetrics(),
            'series' => [
                'sales' => $this->salesAnalytics->emptySeries($dates),
                'interest' => $this->productAnalytics->emptyInterestSeries($dates),
            ],
            'order_status' => $this->orderHealth->emptyWidget(),
            'top_products' => [],
            'top_conversion' => $this->productAnalytics->emptyConversionPage(
                $conversionSort, $conversionDirection, $conversionPage, $conversionPerPage
            ),
            'meta' => $meta,
            'error' => __('admin.dashboard.errors.no_brand'),
        ]);
    }
}
