@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'info',
        'icon' => '✨',
        'title' => 'Дополните свой каталог',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Если у вас появились новинки, добавьте их в каталог бренда <strong>{{ $brand_name ?? '' }}</strong>,
            чтобы посетители увидели больше ваших работ.
        </p>
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            Изготавливаете изделия под заказ? Выберите для них опцию «Под заказ» и укажите срок изготовления.
        </p>

        @isset($button_url)
            @include('emails.partials.button', ['url' => $button_url, 'label' => 'Добавить товар'])
        @endisset

        <p style="margin:24px 0 0;color:#6b7280;font-size:15px;line-height:24px;">
            Нужна помощь? Напишите нам в Instagram —
            <a href="https://www.instagram.com/spra.by" style="color:#7c3aed;text-decoration:none;font-weight:500;">@spra.by</a>.
        </p>
    </div>
@endsection
