@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'success',
        'icon' => '✓',
        'title' => 'Продавец готов к работе',
        'subtitle' => $brand_name ?? null,
    ])

    <div style="padding:24px;">
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Продавец установил пароль и активировал свой аккаунт — можно начинать работу.
        </p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Контактное лицо' => $user_name ?? null,
                'Email' => $user_email ?? null,
            ],
        ])

        @isset($admin_url)
            @include('emails.partials.button', ['url' => $admin_url, 'label' => 'Открыть в админке'])
        @endisset
    </div>
@endsection
