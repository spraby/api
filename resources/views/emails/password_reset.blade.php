@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'info',
        'icon' => '🔑',
        'title' => 'Восстановление пароля',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Мы получили запрос на смену пароля для вашего аккаунта. Чтобы задать
            новый пароль, нажмите на кнопку ниже.
        </p>

        @isset($reset_url)
            @include('emails.partials.button', ['url' => $reset_url, 'label' => 'Сменить пароль'])
        @endisset

        <p style="margin:20px 0 0;color:#6b7280;font-size:15px;line-height:24px;">
            Ссылка действительна <strong>{{ $expires_minutes ?? 60 }} минут</strong> и работает один раз.
            Если вы не запрашивали смену пароля, просто проигнорируйте это письмо — текущий пароль останется прежним.
        </p>

        @isset($reset_url)
            <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;line-height:20px;word-break:break-all;">
                Если кнопка не работает, скопируйте ссылку в браузер:<br>
                <a href="{{ $reset_url }}" style="color:#7c3aed;">{{ $reset_url }}</a>
            </p>
        @endisset
    </div>
@endsection
