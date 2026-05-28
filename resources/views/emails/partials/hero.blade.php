@php
    $heroVariants = [
        'success' => ['bg' => '#ffffff', 'border' => '#10b981', 'icon' => '#10b981', 'sub' => '#6b7280'],
        'alert'   => ['bg' => '#fef3c7', 'border' => '#f59e0b', 'icon' => '#1f2937', 'sub' => '#78350f'],
        'info'    => ['bg' => '#f5f3ff', 'border' => '#7c3aed', 'icon' => '#7c3aed', 'sub' => '#6b7280'],
        'danger'  => ['bg' => '#fef2f2', 'border' => '#ef4444', 'icon' => '#ef4444', 'sub' => '#7f1d1d'],
    ];
    $hv = $heroVariants[$variant ?? 'info'] ?? $heroVariants['info'];
@endphp
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{{ $hv['bg'] }};border-bottom:3px solid {{ $hv['border'] }};">
    <tr>
        <td style="padding:40px 24px 32px;text-align:center;">
            @isset($icon)
                <div style="font-size:48px;line-height:1;margin:0 0 16px;color:{{ $hv['icon'] }};">{{ $icon }}</div>
            @endisset
            <h1 style="margin:0;color:#1f2937;font-size:26px;font-weight:700;line-height:1.2;">{{ $title }}</h1>
            @isset($subtitle)
                <div style="margin:12px 0 0;color:{{ $hv['sub'] }};font-size:16px;">{{ $subtitle }}</div>
            @endisset
        </td>
    </tr>
</table>
