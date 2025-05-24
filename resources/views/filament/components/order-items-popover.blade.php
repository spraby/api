@props(['items'])

<div class="space-y-1" style="{background: tomato}">
    @foreach($items as $item)
        <div class="text-sm">
            {{ $item['label'] }}
        </div>
    @endforeach
</div>
