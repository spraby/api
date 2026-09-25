@extends('emails.layouts.email')

@php
    $status = $status ?? null;
    $isApproved = $status === 'approved';

    $headline = $isApproved
        ? 'Тип аккаунта вашего бренда изменён'
        : 'Заявка на смену типа аккаунта отклонена';

    $body = $isApproved
        ? 'Мы проверили заявку и изменили тип аккаунта вашего бренда.'
        : 'Мы рассмотрели заявку и пока не можем сменить тип аккаунта. Исправьте замечания и отправьте заявку повторно из раздела «Настройки».';
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
                'Тип аккаунта' => $requested_type_label ?? null,
                'Форма занятости' => $requested_employment_type_label ?? null,
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
    </div>
@endsection
