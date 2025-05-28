<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductWidget extends BaseWidget
{
    protected static ?string $pollingInterval = null;

    protected int|string|array $columnSpan = 'full';

    public static function getWidgetGroup(): ?string
    {
        return 'Product Insights';
    }

    protected function getStats(): array
    {
        /**
         * @var User $user
         */
        $user = Auth::user();
        if (!$user) return [];

        $brand = $user->getBrand();
        if (!$brand) return [];

        $totalProducts = $brand->products()->count();

        $views = $brand->products()
            ->join('product_statistics', 'products.id', '=', 'product_statistics.product_id')
            ->where('product_statistics.created_at', '>=', now()->subMonth())
            ->select(
                DB::raw('DATE(product_statistics.created_at) as date'),
                DB::raw("SUM(CASE WHEN product_statistics.type = 'view' THEN 1 ELSE 0 END) as views")
            )
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->pluck('views')
            ->toArray();

        $viewsTotal = array_sum($views);

        return array_filter([
            Stat::make('Total Products', number_format($totalProducts))
                ->description('Total products in the system')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make('Viewed This Month', number_format($viewsTotal))
                ->chart($views),
        ]);
    }
}
