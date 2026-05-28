@extends('emails.layouts.email')

@section('content')
    @include('emails.partials.hero', [
        'variant' => 'danger',
        'icon' => '✕',
        'title' => 'Заявка отклонена',
    ])

    <div style="padding:24px;">
        @include('emails.partials.greeting', ['name' => $name ?? null])
        <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:26px;">
            К сожалению, ваша заявка на регистрацию бренда <strong>{{ $brand_name ?? '' }}</strong> была отклонена.
        </p>

        @if(!empty($rejection_reason))
            <div style="margin:0 0 8px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
                <div style="font-size:12px;color:#991b1b;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px;">Причина</div>
                <div style="color:#7f1d1d;font-size:14px;line-height:1.6;white-space:pre-wrap;">{{ $rejection_reason }}</div>
            </div>
        @endif

        <p style="margin:24px 0 0;color:#6b7280;font-size:15px;line-height:24px;">
            Вы можете подать новую заявку, исправив указанные замечания. Если есть вопросы — ответьте на это письмо.
        </p>
    </div>
@endsection
