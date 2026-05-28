@extends('emails.layouts.email')

@php
    $status = $status ?? null;
    $headline = match ($status) {
        'approved' => 'Ваша заявка на категории одобрена',
        'partial' => 'Заявка на категории рассмотрена частично',
        'rejected' => 'Ваша заявка на категории отклонена',
        default => 'Заявка на категории рассмотрена',
    };
    $body = match ($status) {
        'approved' => 'Все запрошенные категории были одобрены и привязаны к вашему бренду.',
        'partial' => 'Часть запрошенных категорий была одобрена, часть отклонена. Подробности можно посмотреть в личном кабинете.',
        'rejected' => 'Все запрошенные категории были отклонены.',
        default => 'Статус вашей заявки был обновлён.',
    };
    $heroVariant = match ($status) {
        'approved' => 'success',
        'partial' => 'info',
        'rejected' => 'danger',
        default => 'info',
    };
    $heroIcon = match ($status) {
        'approved' => '✓',
        'rejected' => '✕',
        default => '🗂️',
    };
@endphp

@section('content')
    @include('emails.partials.hero', [
        'variant' => $heroVariant,
        'icon' => $heroIcon,
        'title' => $headline,
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $user_name ?? null])
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">{{ $body }}</p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Дата заявки' => $created_at ?? null,
            ],
        ])

        @if(!empty($category_items))
            <h2 style="margin:28px 0 12px;color:#1f2937;font-size:18px;font-weight:600;">Категории</h2>
            @include('emails.partials.chips', ['items' => $category_items])
        @endif
    </div>
@endsection
