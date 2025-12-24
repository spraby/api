<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class BrandAlerts extends Widget
{
    protected string $view = 'filament.widgets.brand-alerts';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 5;

    protected function getViewData(): array
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $productQuery = Product::query();
        $orderQuery = Order::query();

        if ($brand && !$isAdmin) {
            $productQuery->where('brand_id', $brand->id);
            $orderQuery->where('brand_id', $brand->id);
        }

        $alerts = [];

        // Необработанные заказы
        $pendingOrders = (clone $orderQuery)
            ->where('status', Order::STATUSES['PENDING'])
            ->count();

        if ($pendingOrders > 0) {
            $alerts[] = [
                'type' => 'warning',
                'icon' => 'heroicon-o-exclamation-triangle',
                'title' => 'Необработанные заказы',
                'message' => "У вас {$pendingOrders} " . $this->plural($pendingOrders, 'необработанный заказ', 'необработанных заказа', 'необработанных заказов'),
                'action' => '/admin/orders',
                'actionLabel' => 'Перейти к заказам',
            ];
        }

        // Товары без изображений
        $productsWithoutImages = (clone $productQuery)
            ->doesntHave('images')
            ->where('enabled', true)
            ->count();

        if ($productsWithoutImages > 0) {
            $alerts[] = [
                'type' => 'info',
                'icon' => 'heroicon-o-photo',
                'title' => 'Товары без изображений',
                'message' => "{$productsWithoutImages} " . $this->plural($productsWithoutImages, 'активный товар', 'активных товара', 'активных товаров') . ' не имеет изображений',
                'action' => '/admin/products',
                'actionLabel' => 'Посмотреть товары',
            ];
        }

        // Отключенные товары
        $disabledProducts = (clone $productQuery)
            ->where('enabled', false)
            ->count();

        if ($disabledProducts > 0) {
            $alerts[] = [
                'type' => 'gray',
                'icon' => 'heroicon-o-eye-slash',
                'title' => 'Отключенные товары',
                'message' => "{$disabledProducts} " . $this->plural($disabledProducts, 'товар отключен', 'товара отключено', 'товаров отключено') . ' и не отображается в магазине',
                'action' => '/admin/products',
                'actionLabel' => 'Управление товарами',
            ];
        }

        // Новые заказы за последние 24 часа
        $recentOrders = (clone $orderQuery)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        if ($recentOrders > 0) {
            $alerts[] = [
                'type' => 'success',
                'icon' => 'heroicon-o-check-circle',
                'title' => 'Новые заказы',
                'message' => "Получено {$recentOrders} " . $this->plural($recentOrders, 'новый заказ', 'новых заказа', 'новых заказов') . ' за последние 24 часа',
                'action' => '/admin/orders',
                'actionLabel' => 'Просмотреть',
            ];
        }

        // Товары без категории
        $productsWithoutCategory = (clone $productQuery)
            ->whereNull('category_id')
            ->where('enabled', true)
            ->count();

        if ($productsWithoutCategory > 0) {
            $alerts[] = [
                'type' => 'info',
                'icon' => 'heroicon-o-tag',
                'title' => 'Товары без категории',
                'message' => "{$productsWithoutCategory} " . $this->plural($productsWithoutCategory, 'товар', 'товара', 'товаров') . ' не привязан к категории',
                'action' => '/admin/products',
                'actionLabel' => 'Исправить',
            ];
        }

        return [
            'alerts' => collect($alerts),
            'hasAlerts' => count($alerts) > 0,
        ];
    }

    private function plural(int $number, string $one, string $two, string $five): string
    {
        $n = abs($number);
        $n %= 100;
        if ($n >= 5 && $n <= 20) {
            return $five;
        }
        $n %= 10;
        if ($n == 1) {
            return $one;
        }
        if ($n >= 2 && $n <= 4) {
            return $two;
        }
        return $five;
    }
}
