<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductStatistics;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;

class AdvancedStats extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        // Текущий период (последние 30 дней)
        $currentPeriodStart = now()->subDays(30);
        $currentPeriodEnd = now();

        // Предыдущий период (60-30 дней назад)
        $previousPeriodStart = now()->subDays(60);
        $previousPeriodEnd = now()->subDays(30);

        $orderQuery = Order::query();
        $productQuery = Product::query();

        if ($brand && !$isAdmin) {
            $orderQuery->where('brand_id', $brand->id);
            $productQuery->where('brand_id', $brand->id);
        }

        // Текущий период
        $currentOrders = (clone $orderQuery)
            ->whereBetween('created_at', [$currentPeriodStart, $currentPeriodEnd])
            ->count();

        $currentRevenue = OrderItem::query()
            ->whereHas('order', function ($query) use ($brand, $isAdmin, $currentPeriodStart, $currentPeriodEnd) {
                $query->whereBetween('created_at', [$currentPeriodStart, $currentPeriodEnd]);
                if ($brand && !$isAdmin) {
                    $query->where('brand_id', $brand->id);
                }
            })
            ->selectRaw('SUM(final_price * quantity) as total')
            ->value('total') ?? 0;

        $productIds = (clone $productQuery)->pluck('id');
        $currentViews = ProductStatistics::query()
            ->where('type', 'view')
            ->whereIn('product_id', $productIds)
            ->whereBetween('created_at', [$currentPeriodStart, $currentPeriodEnd])
            ->count();

        // Предыдущий период
        $previousOrders = (clone $orderQuery)
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();

        $previousRevenue = OrderItem::query()
            ->whereHas('order', function ($query) use ($brand, $isAdmin, $previousPeriodStart, $previousPeriodEnd) {
                $query->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd]);
                if ($brand && !$isAdmin) {
                    $query->where('brand_id', $brand->id);
                }
            })
            ->selectRaw('SUM(final_price * quantity) as total')
            ->value('total') ?? 0;

        $previousViews = ProductStatistics::query()
            ->where('type', 'view')
            ->whereIn('product_id', $productIds)
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();

        // Расчет процентов изменения
        $ordersChange = $this->calculatePercentageChange($previousOrders, $currentOrders);
        $revenueChange = $this->calculatePercentageChange($previousRevenue, $currentRevenue);
        $viewsChange = $this->calculatePercentageChange($previousViews, $currentViews);

        // Средний чек
        $averageOrderValue = $currentOrders > 0 ? $currentRevenue / $currentOrders : 0;

        // Конверсия (заказы / просмотры)
        $conversion = $currentViews > 0 ? ($currentOrders / $currentViews) * 100 : 0;

        // Заказы сегодня
        $ordersToday = (clone $orderQuery)
            ->whereDate('created_at', today())
            ->count();

        return [
            Stat::make('Выручка за 30 дней', number_format($currentRevenue, 0, ',', ' ') . ' BYN')
                ->description($this->getChangeDescription($revenueChange))
                ->descriptionIcon($this->getChangeIcon($revenueChange))
                ->color($this->getChangeColor($revenueChange))
                ->chart($this->getSparklineData($orderQuery, 7)),

            Stat::make('Заказы за 30 дней', number_format($currentOrders))
                ->description($this->getChangeDescription($ordersChange))
                ->descriptionIcon($this->getChangeIcon($ordersChange))
                ->color($this->getChangeColor($ordersChange)),

            Stat::make('Средний чек', number_format($averageOrderValue, 0, ',', ' ') . ' BYN')
                ->description('За последние 30 дней')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('success'),

            Stat::make('Просмотры за 30 дней', number_format($currentViews))
                ->description($this->getChangeDescription($viewsChange))
                ->descriptionIcon($this->getChangeIcon($viewsChange))
                ->color($this->getChangeColor($viewsChange)),

            Stat::make('Конверсия', number_format($conversion, 2) . '%')
                ->description('Просмотры → Заказы')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('info'),

            Stat::make('Заказы сегодня', number_format($ordersToday))
                ->description(now()->format('d.m.Y'))
                ->descriptionIcon('heroicon-m-calendar')
                ->color('warning'),
        ];
    }

    private function calculatePercentageChange($previous, $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return (($current - $previous) / $previous) * 100;
    }

    private function getChangeDescription(float $percentage): string
    {
        $abs = abs($percentage);
        $formatted = number_format($abs, 1);

        if ($percentage > 0) {
            return "+{$formatted}% к пред. периоду";
        } elseif ($percentage < 0) {
            return "-{$formatted}% к пред. периоду";
        }

        return 'Без изменений';
    }

    private function getChangeIcon(float $percentage): string
    {
        if ($percentage > 0) {
            return 'heroicon-m-arrow-trending-up';
        } elseif ($percentage < 0) {
            return 'heroicon-m-arrow-trending-down';
        }

        return 'heroicon-m-minus';
    }

    private function getChangeColor(float $percentage): string
    {
        if ($percentage > 0) {
            return 'success';
        } elseif ($percentage < 0) {
            return 'danger';
        }

        return 'gray';
    }

    private function getSparklineData($orderQuery, int $days): array
    {
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $count = (clone $orderQuery)
                ->whereDate('created_at', $date)
                ->count();
            $data[] = $count;
        }

        return $data;
    }
}
