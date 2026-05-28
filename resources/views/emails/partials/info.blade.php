@php
    $visibleRows = collect($rows ?? [])->reject(fn ($value) => blank($value));
@endphp
@if($visibleRows->isNotEmpty())
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;border-collapse:separate;">
        @foreach($visibleRows as $label => $value)
            <tr>
                <td style="padding:12px 16px;color:#6b7280;font-size:14px;width:170px;vertical-align:top;{{ $loop->last ? '' : 'border-bottom:1px solid #f3f4f6;' }}">{{ $label }}</td>
                <td style="padding:12px 16px;color:#1f2937;font-size:14px;font-weight:500;vertical-align:top;{{ $loop->last ? '' : 'border-bottom:1px solid #f3f4f6;' }}">{{ $value }}</td>
            </tr>
        @endforeach
    </table>
@endif
