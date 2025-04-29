@php
    $statePath = $getStatePath();
    $images    = $getImages();
    $multiple  = $isMultiple();
@endphp

<div
    x-data="{ selected: @entangle($statePath) }"
    x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('fancybox-style'))]"
    x-load-js="[@js(\Filament\Support\Facades\FilamentAsset::getScriptSrc('fancybox-script')), @js(\Filament\Support\Facades\FilamentAsset::getScriptSrc('fancybox-loader'))]"
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
>
    @foreach ($images as $image)
        @php
            $id            = $image['id'] ?? $image['url'];
            $isSelectedJs  = $multiple
                ? "selected?.includes(`{$id}`)"
                : "selected === `{$id}`";
        @endphp

        <div class="relative z-10">
            <div
                class="relative block overflow-hidden rounded-md border transition z-10"
                :class="{ 'ring-2 ring-primary-600': {{ $isSelectedJs }} }"
                x-on:click.prevent="
                if ({{ $multiple ? 'true' : 'false' }}) {
                    if (selected.includes('{{ $id }}')) {
                        selected = selected.filter(i => i !== '{{ $id }}')
                    } else {
                        selected.push('{{ $id }}')
                    }
                } else {
                    selected = selected === '{{ $id }}' ? null : '{{ $id }}'
                }
            "
            >

                <img
                    src="{{ $image['url'] }}"
                    alt="{{ $image['alt'] ?? '' }}"
                    loading="lazy"
                    class="object-cover w-full h-32 sm:h-36 md:h-40"
                >

                <!-- Полупрозрачная плашка + галочка -->
                <div
                    class="absolute inset-0 bg-primary-600/60 flex items-center justify-center text-white"
                    x-show="{{ $isSelectedJs }}"
                    x-cloak
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

            </div>
            <a class="z-50 text-center block w-full absolute bottom-0 left-0 w-15 h-15 bg-amber-800" href="{{ $image['url'] }}"
               data-fancybox="selector-{{ sha1($statePath) }}">view</a>
        </div>
    @endforeach
</div>
