@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'info',
        'icon' => '🔑',
        'title' => 'Установите пароль',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Ваш бренд <strong>{{ $brand_name ?? '' }}</strong> подтверждён. Чтобы войти в
            личный кабинет, задайте пароль по кнопке ниже.
        </p>

        @isset($set_password_url)
            @include('emails.partials.button', ['url' => $set_password_url, 'label' => 'Установить пароль'])
        @endisset

        <p style="margin:20px 0 0;color:#6b7280;font-size:15px;line-height:24px;">
            Ссылка действительна <strong>{{ $expires_hours ?? 48 }} часов</strong> и работает один раз.
            Если она перестанет действовать, обратитесь к администратору за новой.
        </p>

        @isset($set_password_url)
            <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;line-height:20px;word-break:break-all;">
                Если кнопка не работает, скопируйте ссылку в браузер:<br>
                <a href="{{ $set_password_url }}" style="color:#7c3aed;">{{ $set_password_url }}</a>
            </p>
        @endisset
    </div>
@endsection
