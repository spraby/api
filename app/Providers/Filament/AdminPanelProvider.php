<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use App\Filament\Widgets\AdvancedStats;
use App\Filament\Widgets\BrandAlerts;
use App\Filament\Widgets\BrandOverview;
use App\Filament\Widgets\PopularProducts;
use App\Filament\Widgets\RecentOrders;
use App\Filament\Widgets\SalesChart;
use App\Filament\Widgets\ViewsChart;
use Filament\Support\Assets\Css;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Vite;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->brandName('Spraby')
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Stone,
            ])
            ->navigationGroups([
                'Shop',
                'Users',
                'Settings',
            ])
            ->renderHook(
                'panels::user-menu.before',
                fn () => view('filament.language-switcher')
            )
            ->renderHook(
                'panels::user-menu.before',
                (fn () => view('filament.components.topbar'))
            )
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
                AdvancedStats::class,
                SalesChart::class,
                ViewsChart::class,
                PopularProducts::class,
                RecentOrders::class,
                BrandAlerts::class,
                BrandOverview::class,
            ])
            ->assets([
                Css::make('custom-stylesheet', Vite::asset('resources/css/app.css')),
//                Js::make('custom-script', resource_path('js/custom.js')),
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
                \App\Http\Middleware\SetLocale::class,
            ])
            ->authMiddleware([
                Authenticate::class,
//                'can:access-admin-panel'
            ]);
    }
}
