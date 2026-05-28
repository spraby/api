@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'alert',
        'icon' => '🏷️',
        'title' => 'Новая заявка на бренд',
        'subtitle' => $brand_name ?? null,
    ])

    <div style="padding:24px;">
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Поступила новая заявка на регистрацию бренда. Требуется ваше рассмотрение.
        </p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Контактное лицо' => $name ?? null,
                'Email' => $email ?? null,
                'Телефон' => $phone ?? null,
                'Дата' => $created_at ?? now()->format('d.m.Y H:i'),
            ],
        ])

        @isset($admin_url)
            @include('emails.partials.button', ['url' => $admin_url, 'label' => 'Открыть в админке'])
        @endisset
    </div>
@endsection
