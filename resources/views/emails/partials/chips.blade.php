@php
    // Each item is either a plain string (neutral chip) or an array
    // ['name' => ..., 'status' => ...] for a status-coloured chip.
    $chipPalette = [
        'approved' => ['#ecfdf5', '#a7f3d0', '#065f46'],
        'rejected' => ['#fef2f2', '#fecaca', '#991b1b'],
    ];
    $chipNeutral = ['#f5f3ff', '#ddd6fe', '#5b21b6'];

    $chips = collect($items ?? [])
        ->map(fn ($item) => is_array($item)
            ? ['label' => $item['name'] ?? null, 'colors' => $chipPalette[$item['status'] ?? ''] ?? $chipNeutral]
            : ['label' => $item, 'colors' => $chipNeutral])
        ->filter(fn ($chip) => filled($chip['label']));
@endphp
@if($chips->isNotEmpty())
    <div style="margin:0;">
        @foreach($chips as $chip)
            <span style="display:inline-block;background:{{ $chip['colors'][0] }};border:1px solid {{ $chip['colors'][1] }};color:{{ $chip['colors'][2] }};border-radius:9999px;padding:5px 12px;margin:0 6px 8px 0;font-size:13px;font-weight:500;">{{ $chip['label'] }}</span>
        @endforeach
    </div>
@endif
