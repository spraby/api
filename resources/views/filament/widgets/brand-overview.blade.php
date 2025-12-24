<x-filament-widgets::widget>
    @php
        $metrics = [
            ['label' => __('Товары'), 'value' => number_format($productsCount), 'icon' => 'heroicon-o-cube', 'color' => 'purple'],
            ['label' => __('В наличии'), 'value' => number_format($enabledProductsCount), 'icon' => 'heroicon-o-check-circle', 'color' => 'teal'],
            ['label' => __('Заказы'), 'value' => number_format($ordersCount), 'icon' => 'heroicon-o-shopping-bag', 'color' => 'blue'],
            ['label' => __('Средняя цена'), 'value' => $averagePrice > 0 ? number_format($averagePrice, 2, ',', ' ') . ' BYN' : 'Н/Д', 'icon' => 'heroicon-o-currency-dollar', 'color' => 'yellow'],
            ['label' => __('Просмотры'), 'value' => number_format($productViewsCount), 'icon' => 'heroicon-o-eye', 'color' => 'green'],
            ['label' => __('Изображений'), 'value' => number_format($imagesCount), 'icon' => 'heroicon-o-photo', 'color' => 'orange'],
        ];
        $maxCategory = max($categoryCounts->pluck('count')->all() ?: [1]);
        $totalProducts = $categoryCounts->sum('count');
    @endphp

    <div
        class="grid grid-cols-1 gap-4 lg:grid-cols-2"
        style="grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));"
    >
        {{-- Сводка бренда --}}
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5 h-full">
            <div class="flex items-center justify-between mb-4">
                <x-filament::section.heading>{{ __('Сводка бренда') }}</x-filament::section.heading>
                <div class="flex items-center gap-2">
                    <x-filament::icon
                        icon="heroicon-m-building-storefront"
                        class="h-4 w-4 text-gray-400"
                    />
                    <span class="text-xs font-medium text-gray-400">{{ $brandName }}</span>
                </div>
            </div>

            <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
                @foreach ($metrics as $metric)
                    <div class="group relative overflow-hidden rounded-lg bg-white/5 p-3.5 transition-all hover:bg-white/10 dark:bg-white/10">
                        <div class="flex items-center gap-3">
                            {{-- Иконка --}}
                            <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg
                                @if($metric['color'] === 'purple') bg-purple-500/10
                                @elseif($metric['color'] === 'teal') bg-teal-500/10
                                @elseif($metric['color'] === 'blue') bg-blue-500/10
                                @elseif($metric['color'] === 'yellow') bg-yellow-500/10
                                @elseif($metric['color'] === 'green') bg-green-500/10
                                @elseif($metric['color'] === 'orange') bg-orange-500/10
                                @endif">
                                <x-filament::icon
                                    :icon="$metric['icon']"
                                    class="h-5 w-5
                                        @if($metric['color'] === 'purple') text-purple-400
                                        @elseif($metric['color'] === 'teal') text-teal-400
                                        @elseif($metric['color'] === 'blue') text-blue-400
                                        @elseif($metric['color'] === 'yellow') text-yellow-400
                                        @elseif($metric['color'] === 'green') text-green-400
                                        @elseif($metric['color'] === 'orange') text-orange-400
                                        @endif"
                                />
                            </div>

                            {{-- Значение и лейбл --}}
                            <div class="flex-1 min-w-0">
                                <div class="text-xl font-bold leading-none text-gray-50">{{ $metric['value'] }}</div>
                                <div class="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                    {{ $metric['label'] }}
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </x-filament::card>

        {{-- Категории --}}
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5 h-full">
            <div class="flex items-center justify-between mb-4">
                <x-filament::section.heading>{{ __('Категории') }}</x-filament::section.heading>
                <x-filament::badge color="info">{{ number_format($categoryCounts->count()) }}</x-filament::badge>
            </div>

            <div class="space-y-2">
                @forelse ($categoryCounts as $index => $category)
                    @php
                        $percentage = $maxCategory > 0 ? ($category['count'] / $maxCategory) * 100 : 0;
                        $percentOfTotal = $totalProducts > 0 ? round(($category['count'] / $totalProducts) * 100, 1) : 0;
                        $colors = ['indigo', 'purple', 'pink', 'blue', 'cyan'];
                        $color = $colors[$index % count($colors)];
                    @endphp
                    <div class="group relative overflow-hidden rounded-lg bg-white/5 p-3.5 transition-all hover:bg-white/10 hover:shadow-md dark:bg-white/10">
                        {{-- Прогресс-бар на фоне --}}
                        <div class="absolute inset-0 opacity-20">
                            <div
                                class="h-full transition-all duration-500
                                    @if($color === 'indigo') bg-gradient-to-r from-indigo-500/80 to-indigo-600/60
                                    @elseif($color === 'purple') bg-gradient-to-r from-purple-500/80 to-purple-600/60
                                    @elseif($color === 'pink') bg-gradient-to-r from-pink-500/80 to-pink-600/60
                                    @elseif($color === 'blue') bg-gradient-to-r from-blue-500/80 to-blue-600/60
                                    @elseif($color === 'cyan') bg-gradient-to-r from-cyan-500/80 to-cyan-600/60
                                    @endif"
                                style="width: {{ $percentage }}%"
                            ></div>
                        </div>

                        {{-- Контент --}}
                        <div class="relative flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg
                                    @if($color === 'indigo') bg-indigo-500/25
                                    @elseif($color === 'purple') bg-purple-500/25
                                    @elseif($color === 'pink') bg-pink-500/25
                                    @elseif($color === 'blue') bg-blue-500/25
                                    @elseif($color === 'cyan') bg-cyan-500/25
                                    @endif">
                                    <x-filament::icon
                                        icon="heroicon-m-tag"
                                        class="h-4.5 w-4.5
                                            @if($color === 'indigo') text-indigo-300
                                            @elseif($color === 'purple') text-purple-300
                                            @elseif($color === 'pink') text-pink-300
                                            @elseif($color === 'blue') text-blue-300
                                            @elseif($color === 'cyan') text-cyan-300
                                            @endif"
                                    />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="truncate text-sm font-semibold text-gray-50">{{ $category['name'] }}</div>
                                    <div class="mt-0.5 text-xs text-gray-400">{{ $percentOfTotal }}% от всех товаров</div>
                                </div>
                            </div>
                            <div class="flex items-end">
                                <span class="text-xl font-bold text-gray-50">{{ number_format($category['count']) }}</span>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="rounded-lg bg-white/5 px-4 py-8 text-center">
                        <x-filament::icon
                            icon="heroicon-o-tag"
                            class="mx-auto h-8 w-8 text-gray-500"
                        />
                        <p class="mt-2 text-sm text-gray-400">{{ __('Нет категорий с товарами') }}</p>
                    </div>
                @endforelse
            </div>
        </x-filament::card>
    </div>
</x-filament-widgets::widget>
