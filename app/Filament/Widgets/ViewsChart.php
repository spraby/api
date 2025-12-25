<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use App\Models\ProductStatistics;
use App\Models\User;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ViewsChart extends ChartWidget
{
    protected ?string $heading = 'Просмотры за последние 30 дней';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $productQuery = Product::query();

        if ($brand && !$isAdmin) {
            $productQuery->where('brand_id', $brand->id);
        }

        $productIds = $productQuery->pluck('id');

        $query = ProductStatistics::query()
            ->where('type', 'view')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('product_id', $productIds)
            ->orderBy('created_at');

        $views = $query->get();

        // Группировка просмотров по дням
        $dailyViews = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dailyViews[$date] = 0;
        }

        foreach ($views as $view) {
            $date = $view->created_at->format('Y-m-d');
            if (isset($dailyViews[$date])) {
                $dailyViews[$date]++;
            }
        }

        return [
            'datasets' => [
                [
                    'label' => 'Просмотры',
                    'data' => array_values($dailyViews),
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.1)',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => collect(array_keys($dailyViews))->map(function ($date) {
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
