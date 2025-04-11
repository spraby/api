@php
    $locales = [
        'en' => 'English',
        'ru' => 'Русский',
    ];
@endphp

<x-filament::dropdown placement="bottom-end">
    <x-slot name="trigger">
        <button class="flex items-center justify-center gap-1 rounded-full">
            <span class="text-sm font-medium">
                {{ strtoupper(app()->getLocale()) }}
            </span>
        </button>
    </x-slot>

    <x-filament::dropdown.list>
        @foreach ($locales as $locale => $label)
            <x-filament::dropdown.list.item
                tag="button"
                :icon="app()->getLocale() === $locale ? 'heroicon-m-check' : null"
                @click="window.location.href = '{{ route('set-locale', ['locale' => $locale]) }}'"
            >
                {{ $label }}
            </x-filament::dropdown.list.item>
        @endforeach
    </x-filament::dropdown.list>
</x-filament::dropdown>
