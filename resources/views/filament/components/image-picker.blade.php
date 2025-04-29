@php
    use App\Filament\Components\ImagePicker;
    use App\Models\Image;
    /**
     * @var ImagePicker $field
     * @var Image $image
     */

    $multiple = false;
@endphp

<x-dynamic-component
        :component="$getFieldWrapperView()"
        :field="$field"
>
    <div class="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        @foreach($field->getImages() as $image)
            <label class="relative cursor-pointer group">

                <input
                        type="radio"
                        id="{{ $image->id }}"
                        name="{{ $getName() }}{{ $multiple ? '[]' : '' }}"
                        value="{{ $image->id }}"
                        class="sr-only peer"
                        {{ $applyStateBindingModifiers('wire:model') }}="{{ $getStatePath() }}"
                        :value="{{ $image->id }}"
                />

                <div
                        class="overflow-hidden rounded-lg border border-gray-200
                           peer-checked:ring-2 peer-checked:ring-primary-600
                           transition transform peer-checked:scale-[1.03]"
                >

                    <img src="{{ $image->url }}"
                         alt="{{ $image->name }}"
                         class="aspect-square w-full object-cover"/>
                </div>
            </label>
        @endforeach
    </div>
</x-dynamic-component>
