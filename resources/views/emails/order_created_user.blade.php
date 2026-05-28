@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'success',
        'icon' => '✓',
        'title' => 'Заказ оформлен!',
        'subtitle' => 'Номер заказа: #'.($order_number ?? $order_id ?? '—'),
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $customer_name ?? null])
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Спасибо за заказ. Мы получили его и уже передали информацию продавцу <strong>{{ $brand_name ?? '—' }}</strong>.
        </p>

        @include('emails.partials.info', [
            'rows' => [
                'Номер заказа' => '#'.($order_number ?? $order_id ?? '—'),
                'Продавец' => $brand_name ?? null,
                'Сумма' => $total ?? null,
            ],
        ])

        @isset($status_url)
            @include('emails.partials.button', ['url' => $status_url, 'label' => 'Отслеживать заказ'])
        @endisset

        <div style="height:1px;background:#e5e7eb;margin:28px 0;"></div>

        <h2 style="margin:0 0 8px;color:#1f2937;font-size:18px;font-weight:600;">Что дальше?</h2>
        <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:26px;">
            Продавец свяжется с вами в ближайшее время для уточнения деталей доставки и оплаты.
        </p>

        @foreach(['Продавец подтвердит наличие товара', 'Согласуете способ доставки', 'Получите ваш заказ!'] as $i => $step)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
                <tr>
                    <td style="width:28px;vertical-align:top;padding-right:12px;">
                        <div style="width:28px;height:28px;background:#ede9fe;color:#7c3aed;border-radius:50%;font-size:14px;font-weight:700;line-height:28px;text-align:center;">{{ $i + 1 }}</div>
                    </td>
                    <td style="vertical-align:top;padding-top:4px;color:#4b5563;font-size:15px;line-height:1.5;">{{ $step }}</td>
                </tr>
            </table>
        @endforeach
    </div>
@endsection
