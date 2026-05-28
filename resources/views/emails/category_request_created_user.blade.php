@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'info',
        'icon' => '🗂️',
        'title' => 'Заявка на категории принята',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $user_name ?? null])
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Мы получили вашу заявку на добавление категорий для бренда <strong>{{ $brand_name ?? '' }}</strong>. Команда {{ config('app.name') }} рассмотрит её в ближайшее время и пришлёт результат на этот адрес.
        </p>

        @if(!empty($categories))
            <h2 style="margin:0 0 12px;color:#1f2937;font-size:18px;font-weight:600;">Запрошенные категории</h2>
            @include('emails.partials.chips', ['items' => $categories])
        @endif

        @if(!empty($comment))
            <div style="margin-top:24px;">
                @include('emails.partials.note', ['label' => 'Ваш комментарий', 'text' => $comment])
            </div>
        @endif
    </div>
@endsection
