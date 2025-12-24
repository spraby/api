<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use App\Models\Image;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductStatistics;
use App\Models\User;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class BrandOverview extends Widget
{
    protected string $view = 'filament.widgets.brand-overview';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 6;

    /**
     * @return array{
     *     brandName: string,
     *     productsCount: int,
     *     ordersCount: int,
     *     imagesCount: int,
     *     productViewsCount: int,
     *     categoryCounts: \Illuminate\Support\Collection<int, array{name: string, count: int}>
     * }
     */
    protected function getViewData(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();

        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $productQuery = Product::query();
        $orderQuery = Order::query();
        $categoryQuery = Category::query();

        if ($brand && !$isAdmin) {
            $productQuery->where('brand_id', $brand->id);
            $orderQuery->where('brand_id', $brand->id);
            $categoryQuery->whereHas('products', fn($query) => $query->where('brand_id', $brand->id));

            $imagesCount = $brand->images()->count();
        } else {
            $categoryQuery->whereHas('products');
            $imagesCount = Image::query()->count();
            $brand = null;
        }

        $productsCount = (clone $productQuery)->count();
        $enabledProductsCount = (clone $productQuery)->where('enabled', true)->count();
        $productIds = (clone $productQuery)->pluck('id');
        $ordersCount = (clone $orderQuery)->count();

        // Средняя цена товаров
        $averagePrice = (clone $productQuery)
            ->where('enabled', true)
            ->avg('final_price');

        /** @var Collection<int, array{name: string, count: int}> $categoryCounts */
        $categoryCounts = $categoryQuery
            ->withCount([
                'products' => function ($query) use ($brand) {
                    $query->when($brand, fn($relation) => $relation->where('brand_id', $brand->id));
                },
            ])
            ->orderByDesc('products_count')
            ->get()
            ->map(fn(Category $category) => [
                'name' => $category->name,
                'count' => (int) $category->products_count,
            ]);

        $productViewsQuery = ProductStatistics::query()->where('type', 'view');

        if ($productIds->isNotEmpty()) {
            $productViewsQuery->whereIn('product_id', $productIds);
        } else {
            $productViewsQuery->whereRaw('1 = 0');
        }

        return [
            'brandName' => $brand?->name ?? __('All brands'),
            'productsCount' => $productsCount,
            'enabledProductsCount' => $enabledProductsCount,
            'ordersCount' => $ordersCount,
            'imagesCount' => $imagesCount,
            'productViewsCount' => $productViewsQuery->count(),
            'averagePrice' => $averagePrice ? round($averagePrice, 2) : 0,
            'categoryCounts' => $categoryCounts,
        ];
    }
}
