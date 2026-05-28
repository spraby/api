@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'info',
        'icon' => '✉',
        'title' => 'Заявка принята',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Мы получили вашу заявку на регистрацию бренда <strong>{{ $brand_name ?? '' }}</strong>. Команда {{ config('app.name') }} рассмотрит её в ближайшее время и свяжется с вами по адресу <strong>{{ $email }}</strong>.
        </p>
        <p style="margin:0;color:#6b7280;font-size:15px;line-height:24px;">
            Если у вас есть дополнительная информация — просто ответьте на это письмо.
        </p>
    </div>
@endsection
