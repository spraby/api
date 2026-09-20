@extends('emails.layouts.email')

@php
    $status = $status ?? null;
    $isApproved = $status === 'approved';

    $headline = $isApproved
        ? 'Страница вашего бренда опубликована'
        : 'Заявка на публикацию страницы отклонена';

    $body = $isApproved
        ? 'Мы проверили ваш бренд и опубликовали его персональную страницу.'
        : 'Мы рассмотрели заявку и пока не можем опубликовать страницу бренда. Исправьте замечания и отправьте заявку повторно из раздела «Настройки».';
@endphp

@section('content')
    @include('emails.partials.hero', [
        'variant' => $isApproved ? 'success' : 'danger',
        'icon' => $isApproved ? '✓' : '✕',
        'title' => $headline,
        'subtitle' => $brand_name ?? null,
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $user_name ?? null])
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">{{ $body }}</p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Дата заявки' => $created_at ?? null,
                'Рассмотрена' => $reviewed_at ?? null,
            ],
        ])

        @if(!empty($reason))
            <div style="margin-top:24px;">
                @include('emails.partials.note', [
                    'label' => $isApproved ? 'Комментарий модератора' : 'Причина отказа',
                    'text' => $reason,
                ])
            </div>
        @endif

        @if($isApproved && !empty($page_url))
            @include('emails.partials.button', ['url' => $page_url, 'label' => 'Открыть страницу бренда'])
        @endif
    </div>
@endsection
