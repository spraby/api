@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'alert',
        'icon' => '🛍️',
        'title' => 'Новый заказ!',
        'subtitle' => 'Заказ #'.($order_number ?? $order_id ?? '—'),
    ])

    <div style="padding:24px;">
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Поступил новый заказ{{ !empty($brand_name) ? ' для бренда '.$brand_name : '' }}. Свяжитесь с покупателем в ближайшее время.
        </p>

        <h2 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Детали заказа</h2>
        @include('emails.partials.info', [
            'rows' => [
                'Заказ' => '#'.($order_number ?? $order_id ?? '—'),
                'Бренд' => $brand_name ?? null,
                'Сумма' => $total ?? null,
            ],
        ])

        <h2 style="margin:28px 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Информация о покупателе</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dbeafe;border-radius:12px;border-collapse:separate;background:#f8fafc;">
            <tr>
                <td style="padding:12px 16px;color:#6b7280;font-size:14px;width:140px;vertical-align:top;border-bottom:1px solid #eef2f7;">Имя</td>
                <td style="padding:12px 16px;color:#1f2937;font-size:14px;font-weight:500;vertical-align:top;border-bottom:1px solid #eef2f7;">{{ $customer_name ?? '—' }}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#6b7280;font-size:14px;vertical-align:top;border-bottom:1px solid #eef2f7;">Email</td>
                <td style="padding:12px 16px;font-size:14px;font-weight:500;vertical-align:top;border-bottom:1px solid #eef2f7;">
                    @if(!empty($customer_email))
                        <a href="mailto:{{ $customer_email }}" style="color:#7c3aed;text-decoration:none;">{{ $customer_email }}</a>
                    @else
                        —
                    @endif
                </td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#6b7280;font-size:14px;vertical-align:top;">Телефон</td>
                <td style="padding:12px 16px;font-size:14px;font-weight:500;vertical-align:top;">
                    @if(!empty($customer_phone))
                        <a href="tel:{{ $customer_phone }}" style="color:#7c3aed;text-decoration:none;">{{ $customer_phone }}</a>
                    @else
                        —
                    @endif
                </td>
            </tr>
        </table>

        <div style="height:1px;background:#e5e7eb;margin:28px 0;"></div>

        <h2 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Требуется действие</h2>
        @foreach(['Свяжитесь с покупателем для подтверждения заказа', 'Уточните детали доставки', 'Согласуйте способ оплаты'] as $action)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
                <tr>
                    <td style="width:22px;vertical-align:top;color:#9ca3af;font-size:18px;line-height:1.4;">☐</td>
                    <td style="vertical-align:top;color:#4b5563;font-size:15px;line-height:1.5;">{{ $action }}</td>
                </tr>
            </table>
        @endforeach

        @isset($admin_url)
            @include('emails.partials.button', ['url' => $admin_url, 'label' => 'Открыть заказ'])
        @endisset
    </div>
@endsection
