<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use App\Models\User;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PopularProducts extends Widget
{
    protected string $view = 'filament.widgets.popular-products';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 4;

    protected function getViewData(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $productQuery = Product::query();

        if ($brand && !$isAdmin) {
            $productQuery->where('brand_id', $brand->id);
        }

        // Топ товаров по заказам
        $topByOrders = (clone $productQuery)
            ->select('products.*')
            ->with(['images.image', 'category'])
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->selectRaw('COUNT(order_items.id) as orders_count')
            ->selectRaw('SUM(order_items.quantity) as total_quantity')
            ->groupBy('products.id')
            ->orderByDesc('orders_count')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'category' => $product->category?->name ?? 'Без категории',
                    'orders' => $product->orders_count,
                    'quantity' => $product->total_quantity,
                    'revenue' => $product->final_price * $product->total_quantity,
                    'image_url' => $product->mainImage?->image?->url,
                    'price' => $product->final_price,
                    'external_url' => $product->externalUrl,
                ];
            });

        // Топ товаров по просмотрам
        $topByViews = (clone $productQuery)
            ->select('products.*')
            ->with(['images.image', 'category'])
            ->join('product_statistics', 'products.id', '=', 'product_statistics.product_id')
            ->where('product_statistics.type', 'view')
            ->selectRaw('COUNT(product_statistics.id) as views_count')
            ->groupBy('products.id')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'category' => $product->category?->name ?? 'Без категории',
                    'views' => $product->views_count,
                    'image_url' => $product->mainImage?->image?->url,
                    'price' => $product->final_price,
                    'external_url' => $product->externalUrl,
                ];
            });

        return [
            'topByOrders' => $topByOrders,
            'topByViews' => $topByViews,
        ];
    }
}
