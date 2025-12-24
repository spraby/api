<x-filament-widgets::widget>
    @if ($hasAlerts)
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5">
            <div class="flex items-center justify-between mb-4">
                <x-filament::section.heading>{{ __('Уведомления и оповещения') }}</x-filament::section.heading>
                <x-filament::badge color="primary">{{ $alerts->count() }}</x-filament::badge>
            </div>

            <div class="space-y-2">
                @foreach ($alerts as $alert)
                    <a
                        href="{{ $alert['action'] ?? '#' }}"
                        class="group flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-all hover:bg-white/10 hover:shadow-md dark:bg-white/10
                            @if($alert['type'] === 'warning') border-l-2 border-yellow-500/60
                            @elseif($alert['type'] === 'info') border-l-2 border-blue-500/60
                            @elseif($alert['type'] === 'success') border-l-2 border-green-500/60
                            @elseif($alert['type'] === 'danger') border-l-2 border-red-500/60
                            @else border-l-2 border-gray-500/60
                            @endif"
                    >
                        {{-- Иконка с фоном --}}
                        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg
                            @if($alert['type'] === 'warning') bg-yellow-500/15
                            @elseif($alert['type'] === 'info') bg-blue-500/15
                            @elseif($alert['type'] === 'success') bg-green-500/15
                            @elseif($alert['type'] === 'danger') bg-red-500/15
                            @else bg-gray-500/15
                            @endif">
                            <x-filament::icon
                                :icon="$alert['icon']"
                                class="h-5 w-5
                                    @if($alert['type'] === 'warning') text-yellow-400
                                    @elseif($alert['type'] === 'info') text-blue-400
                                    @elseif($alert['type'] === 'success') text-green-400
                                    @elseif($alert['type'] === 'danger') text-red-400
                                    @else text-gray-400
                                    @endif"
                            />
                        </div>

                        {{-- Контент --}}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <h4 class="text-sm font-semibold text-gray-50">{{ $alert['title'] }}</h4>
                                <x-filament::badge
                                    :color="match($alert['type']) {
                                        'warning' => 'warning',
                                        'info' => 'info',
                                        'success' => 'success',
                                        'danger' => 'danger',
                                        default => 'gray'
                                    }"
                                    size="xs"
                                >
                                    {{ match($alert['type']) {
                                        'warning' => 'Важно',
                                        'info' => 'Инфо',
                                        'success' => 'Успех',
                                        'danger' => 'Критично',
                                        default => 'Заметка'
                                    } }}
                                </x-filament::badge>
                            </div>
                            <p class="mt-0.5 text-xs text-gray-400">{{ $alert['message'] }}</p>
                        </div>

                        {{-- Стрелка --}}
                        @if(isset($alert['action']))
                            <div class="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                                <x-filament::icon
                                    icon="heroicon-m-arrow-right"
                                    class="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1
                                        @if($alert['type'] === 'warning') group-hover:text-yellow-400
                                        @elseif($alert['type'] === 'info') group-hover:text-blue-400
                                        @elseif($alert['type'] === 'success') group-hover:text-green-400
                                        @elseif($alert['type'] === 'danger') group-hover:text-red-400
                                        @endif"
                                />
                            </div>
                        @endif
                    </a>
                @endforeach
            </div>
        </x-filament::card>
    @else
        <x-filament::card class="bg-white/5 shadow-sm dark:bg-white/5">
            <div class="flex items-center gap-4 rounded-lg bg-green-500/5 p-4">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500/15">
                    <x-filament::icon
                        icon="heroicon-o-check-badge"
                        class="h-6 w-6 text-green-400"
                    />
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-50">Всё отлично!</h3>
                    <p class="mt-0.5 text-xs text-gray-400">Нет важных уведомлений, продолжайте в том же духе</p>
                </div>
            </div>
        </x-filament::card>
    @endif
</x-filament-widgets::widget>
