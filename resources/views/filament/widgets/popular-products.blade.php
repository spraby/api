<x-filament-widgets::widget>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {{-- Топ по заказам --}}
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5">
            <div class="flex items-center justify-between mb-4">
                <x-filament::section.heading>{{ __('Топ товаров по заказам') }}</x-filament::section.heading>
                <x-filament::badge color="success">{{ $topByOrders->count() }}</x-filament::badge>
            </div>

            <div class="space-y-2">
                @forelse ($topByOrders as $index => $product)
                    <div class="group relative flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-all hover:bg-white/10 hover:shadow-lg dark:bg-white/10">
                        {{-- Позиция (медаль для топ-3) --}}
                        <div class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                            @if($index === 0) bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 text-yellow-300 ring-2 ring-yellow-500/40
                            @elseif($index === 1) bg-gradient-to-br from-gray-300/30 to-gray-500/30 text-gray-300 ring-2 ring-gray-400/40
                            @elseif($index === 2) bg-gradient-to-br from-orange-400/30 to-orange-600/30 text-orange-300 ring-2 ring-orange-500/40
                            @else bg-purple-500/20 text-purple-300
                            @endif
                        ">
                            <span class="text-sm font-bold">{{ $index + 1 }}</span>
                        </div>

                        {{-- Изображение товара --}}
                        <div class="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white/10">
                            @if($product['image_url'])
                                <img
                                    src="{{ $product['image_url'] }}"
                                    alt=""
                                    class="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                />
                                <div class="hidden h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <x-filament::icon
                                        icon="heroicon-o-photo"
                                        class="h-5 w-5 text-gray-500"
                                    />
                                </div>
                            @else
                                <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <x-filament::icon
                                        icon="heroicon-o-photo"
                                        class="h-5 w-5 text-gray-500"
                                    />
                                </div>
                            @endif
                        </div>

                        {{-- Информация о товаре --}}
                        <div class="min-w-0 flex-1">
                            <h4 class="truncate text-sm font-semibold text-gray-50 group-hover:text-purple-300 transition-colors">
                                {{ $product['title'] }}
                            </h4>
                            <div class="mt-0.5 flex items-center gap-2 text-xs">
                                <span class="inline-flex items-center gap-1 text-gray-400">
                                    <x-filament::icon
                                        icon="heroicon-m-tag"
                                        class="h-3 w-3"
                                    />
                                    <span class="truncate">{{ $product['category'] }}</span>
                                </span>
                                @if($product['price'])
                                    <span class="text-gray-400">•</span>
                                    <span class="font-semibold text-green-400">{{ number_format($product['price'], 0, ',', ' ') }} BYN</span>
                                @endif
                            </div>
                        </div>

                        {{-- Статистика заказов --}}
                        <div class="flex flex-shrink-0 flex-col gap-1">
                            <div class="flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-1">
                                <x-filament::icon
                                    icon="heroicon-s-shopping-bag"
                                    class="h-3.5 w-3.5 text-purple-400"
                                />
                                <span class="text-xs font-bold text-purple-300">{{ number_format($product['orders']) }}</span>
                            </div>
                            <div class="flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1">
                                <x-filament::icon
                                    icon="heroicon-s-currency-dollar"
                                    class="h-3.5 w-3.5 text-green-400"
                                />
                                <span class="text-xs font-bold text-green-300">{{ number_format($product['revenue'], 0, ',', ' ') }}</span>
                            </div>
                        </div>

                        {{-- Ссылка на товар в магазине --}}
                        @if($product['external_url'])
                            <a
                                href="{{ $product['external_url'] }}"
                                target="_blank"
                                class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Открыть в магазине"
                            >
                                <x-filament::icon
                                    icon="heroicon-m-arrow-top-right-on-square"
                                    class="h-4 w-4 text-gray-400 hover:text-purple-400 transition-colors"
                                />
                            </a>
                        @endif
                    </div>
                @empty
                    <div class="rounded-lg bg-white/5 px-4 py-8 text-center">
                        <x-filament::icon
                            icon="heroicon-o-shopping-bag"
                            class="mx-auto h-8 w-8 text-gray-500"
                        />
                        <p class="mt-2 text-sm text-gray-400">{{ __('Нет данных о заказах') }}</p>
                    </div>
                @endforelse
            </div>
        </x-filament::card>

        {{-- Топ по просмотрам --}}
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5">
            <div class="flex items-center justify-between mb-4">
                <x-filament::section.heading>{{ __('Топ товаров по просмотрам') }}</x-filament::section.heading>
                <x-filament::badge color="info">{{ $topByViews->count() }}</x-filament::badge>
            </div>

            <div class="space-y-2">
                @forelse ($topByViews as $index => $product)
                    <div class="group relative flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-all hover:bg-white/10 hover:shadow-lg dark:bg-white/10">
                        {{-- Позиция (медаль для топ-3) --}}
                        <div class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                            @if($index === 0) bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 text-yellow-300 ring-2 ring-yellow-500/40
                            @elseif($index === 1) bg-gradient-to-br from-gray-300/30 to-gray-500/30 text-gray-300 ring-2 ring-gray-400/40
                            @elseif($index === 2) bg-gradient-to-br from-orange-400/30 to-orange-600/30 text-orange-300 ring-2 ring-orange-500/40
                            @else bg-indigo-500/20 text-indigo-300
                            @endif
                        ">
                            <span class="text-sm font-bold">{{ $index + 1 }}</span>
                        </div>

                        {{-- Изображение товара --}}
                        <div class="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white/10">
                            @if($product['image_url'])
                                <img
                                    src="{{ $product['image_url'] }}"
                                    alt=""
                                    class="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                />
                                <div class="hidden h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                    <x-filament::icon
                                        icon="heroicon-o-photo"
                                        class="h-5 w-5 text-gray-500"
                                    />
                                </div>
                            @else
                                <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                    <x-filament::icon
                                        icon="heroicon-o-photo"
                                        class="h-5 w-5 text-gray-500"
                                    />
                                </div>
                            @endif
                        </div>

                        {{-- Информация о товаре --}}
                        <div class="min-w-0 flex-1">
                            <h4 class="truncate text-sm font-semibold text-gray-50 group-hover:text-indigo-300 transition-colors">
                                {{ $product['title'] }}
                            </h4>
                            <div class="mt-0.5 flex items-center gap-2 text-xs">
                                <span class="inline-flex items-center gap-1 text-gray-400">
                                    <x-filament::icon
                                        icon="heroicon-m-tag"
                                        class="h-3 w-3"
                                    />
                                    <span class="truncate">{{ $product['category'] }}</span>
                                </span>
                                @if($product['price'])
                                    <span class="text-gray-400">•</span>
                                    <span class="font-semibold text-green-400">{{ number_format($product['price'], 0, ',', ' ') }} BYN</span>
                                @endif
                            </div>
                        </div>

                        {{-- Счетчик просмотров --}}
                        <div class="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-indigo-500/10 px-3 py-1.5">
                            <x-filament::icon
                                icon="heroicon-s-eye"
                                class="h-4 w-4 text-indigo-400"
                            />
                            <span class="text-sm font-bold text-indigo-300">{{ number_format($product['views']) }}</span>
                        </div>

                        {{-- Ссылка на товар в магазине --}}
                        @if($product['external_url'])
                            <a
                                href="{{ $product['external_url'] }}"
                                target="_blank"
                                class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Открыть в магазине"
                            >
                                <x-filament::icon
                                    icon="heroicon-m-arrow-top-right-on-square"
                                    class="h-4 w-4 text-gray-400 hover:text-indigo-400 transition-colors"
                                />
                            </a>
                        @endif
                    </div>
                @empty
                    <div class="rounded-lg bg-white/5 px-4 py-8 text-center">
                        <x-filament::icon
                            icon="heroicon-o-eye-slash"
                            class="mx-auto h-8 w-8 text-gray-500"
                        />
                        <p class="mt-2 text-sm text-gray-400">{{ __('Нет данных о просмотрах') }}</p>
                    </div>
                @endforelse
            </div>
        </x-filament::card>
    </div>
</x-filament-widgets::widget>
