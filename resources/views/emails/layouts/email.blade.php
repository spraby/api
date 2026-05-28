<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $subject ?? config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f9;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
                    {{-- Header --}}
                    <tr>
                        <td style="padding:32px 24px;text-align:center;border-bottom:1px solid #e5e7eb;">
                            <a href="{{ config('app.url') }}" style="text-decoration:none;color:#7c3aed;font-size:32px;font-weight:700;letter-spacing:-0.5px;">{{ config('app.name') }}</a>
                            <div style="color:#1f2937;font-size:14px;margin-top:12px;">маркетплейс авторских товаров</div>
                        </td>
                    </tr>
                    {{-- Content (sections manage their own padding) --}}
                    <tr>
                        <td style="padding:0;">
                            @yield('content')
                        </td>
                    </tr>
                    {{-- Footer --}}
                    <tr>
                        <td style="padding:24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                            <div style="color:#6b7280;font-size:14px;line-height:22px;margin:0 0 8px;">
                                По всем вопросам:
                                <a href="mailto:{{ $supportEmail ?? (config('resend.reply_to') ?: 'support@spra.by') }}" style="color:#7c3aed;text-decoration:none;font-weight:500;">{{ $supportEmail ?? (config('resend.reply_to') ?: 'support@spra.by') }}</a>
                            </div>
                            <div style="color:#9ca3af;font-size:12px;">&copy; {{ date('Y') }} {{ config('app.name') }}. Это автоматическое сообщение, отвечать на него не нужно.</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
