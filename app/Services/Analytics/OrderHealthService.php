<?php

namespace App\Services\Analytics;

use App\Enums\FinancialStatus;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OrderHealthService
{
    private const PENDING_STALE_DAYS = 2;
    private const PROCESSING_STALE_DAYS = 5;
    private const UNPAID_STALE_DAYS = 3;

    public function getHealthWidget(Carbon $start, Carbon $end, ?string $brandId): array
    {
        $cacheKey = sprintf(
            'analytics:order_health:%s:%s:%s',
            $brandId ?? 'all',
            $start->toDateString(),
            $end->toDateString()
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($start, $end, $brandId) {
            $statusCounts = $this->getStatusCounts($start, $end, $brandId);
            $statusTotal = array_sum($statusCounts);
            $summary = $this->getSummary($start, $end, $brandId);

            $activeTotal = (int) ($summary->active_total ?? 0);
            $needsAttention = (int) ($summary->needs_attention ?? 0);
            $health = $activeTotal > 0
                ? max(0, min(100, (1 - ($needsAttention / $activeTotal)) * 100))
                : null;

            return [
                'health' => $health,
                'paid_total' => (float) ($summary->paid_total ?? 0),
                'paid_count' => (int) ($summary->paid_count ?? 0),
                'partial_paid_total' => (float) ($summary->partial_paid_total ?? 0),
                'partial_paid_count' => (int) ($summary->partial_paid_count ?? 0),
                'unpaid_total' => (float) ($summary->unpaid_total ?? 0),
                'unpaid_count' => (int) ($summary->unpaid_count ?? 0),
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

    public function emptyWidget(): array
    {
        return [
            'health' => null,
            'paid_total' => 0,
            'paid_count' => 0,
            'partial_paid_total' => 0,
            'partial_paid_count' => 0,
            'unpaid_total' => 0,
            'unpaid_count' => 0,
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

    private function getStatusCounts(Carbon $start, Carbon $end, ?string $brandId): array
    {
        $statusCounts = array_fill_keys(OrderStatus::values(), 0);

        $rows = DB::table('orders as o')
            ->whereBetween('o.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->selectRaw('o.status as status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('o.status')
            ->get();

        foreach ($rows as $row) {
            if (array_key_exists($row->status, $statusCounts)) {
                $statusCounts[$row->status] = (int) $row->total;
            }
        }

        return $statusCounts;
    }

    private function getSummary(Carbon $start, Carbon $end, ?string $brandId): object
    {
        $totalsSubquery = DB::table('order_items as oi')
            ->join('orders as oo', 'oo.id', '=', 'oi.order_id')
            ->whereBetween('oo.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('oo.brand_id', $brandId))
            ->whereNotIn('oo.status', OrderStatus::excluded())
            ->selectRaw('oi.order_id, COALESCE(SUM(oi.final_price * oi.quantity), 0) as total')
            ->groupBy('oi.order_id');

        $pendingThreshold = now()->subDays(self::PENDING_STALE_DAYS);
        $processingThreshold = now()->subDays(self::PROCESSING_STALE_DAYS);
        $unpaidThreshold = now()->subDays(self::UNPAID_STALE_DAYS);

        return DB::table('orders as o')
            ->leftJoinSub($totalsSubquery, 'ot', fn ($join) => $join->on('ot.order_id', '=', 'o.id'))
            ->whereBetween('o.created_at', [$start, $end])
            ->when($brandId, fn ($query) => $query->where('o.brand_id', $brandId))
            ->whereNotIn('o.status', OrderStatus::excluded())
            ->selectRaw('COUNT(*) as active_total')
            ->selectRaw(
                "SUM(CASE WHEN o.financial_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count"
            )
            ->selectRaw(
                "SUM(CASE WHEN o.financial_status = 'partial_paid' THEN 1 ELSE 0 END) as partial_paid_count"
            )
            ->selectRaw(
                "SUM(CASE WHEN o.financial_status = 'paid' THEN 1 ELSE 0 END) as paid_count"
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN o.financial_status = 'unpaid' THEN COALESCE(ot.total, 0) ELSE 0 END), 0) as unpaid_total"
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN o.financial_status = 'partial_paid' THEN COALESCE(ot.total, 0) ELSE 0 END), 0) as partial_paid_total"
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN o.financial_status = 'paid' THEN COALESCE(ot.total, 0) ELSE 0 END), 0) as paid_total"
            )
            ->selectRaw(
                "SUM(CASE WHEN o.status IN ('pending', 'confirmed') AND o.updated_at <= ? THEN 1 ELSE 0 END) as pending_overdue",
                [$pendingThreshold]
            )
            ->selectRaw(
                "SUM(CASE WHEN o.status = 'processing' AND o.updated_at <= ? THEN 1 ELSE 0 END) as processing_overdue",
                [$processingThreshold]
            )
            ->selectRaw(
                "SUM(CASE WHEN o.financial_status = 'unpaid' AND o.updated_at <= ? THEN 1 ELSE 0 END) as unpaid_overdue",
                [$unpaidThreshold]
            )
            ->selectRaw(
                "SUM(CASE WHEN (
                    (o.status IN ('pending', 'confirmed') AND o.updated_at <= ?)
                    OR (o.status = 'processing' AND o.updated_at <= ?)
                    OR (o.financial_status = 'unpaid' AND o.updated_at <= ?)
                ) THEN 1 ELSE 0 END) as needs_attention",
                [$pendingThreshold, $processingThreshold, $unpaidThreshold]
            )
            ->first();
    }
}
