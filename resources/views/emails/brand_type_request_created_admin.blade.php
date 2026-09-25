@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'alert',
        'icon' => '🏷️',
        'title' => 'Заявка на смену типа аккаунта',
        'subtitle' => $brand_name ?? null,
    ])

    <div style="padding:24px;">
        <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:26px;">
            Бренд просит сменить тип аккаунта и форму занятости. Требуется ваше рассмотрение.
        </p>

        @include('emails.partials.info', [
            'rows' => [
                'Бренд' => $brand_name ?? null,
                'Тип аккаунта' => $requested_type_label ?? null,
                'Форма занятости' => $requested_employment_type_label ?? null,
                'Наименование' => $requested_employment_name ?? null,
                'УНП' => $requested_employment_number ?? null,
                'Менеджер' => $user_name ?? null,
                'Email' => $user_email ?? null,
                'Дата' => $created_at ?? now()->format('d.m.Y H:i'),
            ],
        ])

        @isset($admin_url)
            @include('emails.partials.button', ['url' => $admin_url, 'label' => 'Открыть заявку'])
        @endisset
    </div>
@endsection
