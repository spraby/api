@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'success',
        'icon' => '✓',
        'title' => 'Заявка одобрена',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Рады сообщить, что ваша заявка на регистрацию бренда <strong>{{ $brand_name ?? '' }}</strong> одобрена.
        </p>

        @isset($login_url)
            @include('emails.partials.button', ['url' => $login_url, 'label' => 'Войти в админку'])
        @endisset

        <p style="margin:24px 0 0;color:#6b7280;font-size:15px;line-height:24px;">
            Если возникнут вопросы — просто ответьте на это письмо.
        </p>
    </div>
@endsection
