<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\User;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SalesChart extends ChartWidget
{
    protected ?string $heading = 'Продажи за последние 30 дней';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $query = Order::query()
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at');

        if ($brand && !$isAdmin) {
            $query->where('brand_id', $brand->id);
        }

        $orders = $query->get();

        // Группировка заказов по дням
        $dailyOrders = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dailyOrders[$date] = 0;
        }

        foreach ($orders as $order) {
            $date = $order->created_at->format('Y-m-d');
            if (isset($dailyOrders[$date])) {
                $dailyOrders[$date]++;
            }
        }

        return [
            'datasets' => [
                [
                    'label' => 'Заказы',
                    'data' => $dailyOrders->values()->toArray(),
                    'borderColor' => 'rgb(139, 92, 246)',
                    'backgroundColor' => 'rgba(139, 92, 246, 0.1)',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => $dailyOrders->keys()->map(function ($date) {
                return Carbon::parse($date)->format('d.m');
            })->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'precision' => 0,
                    ],
                ],
                'x' => [
                    'ticks' => [
                        'maxRotation' => 0,
                        'minRotation' => 0,
                    ],
                ],
            ],
        ];
    }
}
