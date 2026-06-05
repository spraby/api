@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'alert',
        'icon' => '🗂️',
        'title' => 'Новая заявка на категории',
        'subtitle' => $brand_name ?? null,
    ])

    <div style="padding:24px;">
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Поступила новая заявка на добавление категорий. Требуется ваше рассмотрение.
        </p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Менеджер' => $user_name ?? null,
                'Email' => $user_email ?? null,
                'Дата' => $created_at ?? now()->format('d.m.Y H:i'),
            ],
        ])

        @if(!empty($categories))
            <h2 style="margin:28px 0 12px;color:#1f2937;font-size:18px;font-weight:600;">Запрошенные категории</h2>
            @include('emails.partials.chips', ['items' => $categories])
        @endif

        @isset($admin_url)
            @include('emails.partials.button', ['url' => $admin_url, 'label' => 'Открыть в админке'])
        @endisset
    </div>
@endsection
