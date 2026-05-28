<?php

return [
    'api_key' => env('RESEND_API_KEY'),

    'from' => [
        'address' => env('RESEND_FROM_ADDRESS'),
        'name' => env('RESEND_FROM_NAME', env('APP_NAME')),
    ],

    'reply_to' => env('RESEND_REPLY_TO'),

    'batch_size' => (int) env('EMAILS_QUEUE_BATCH_SIZE', 50),

    'retry_backoff_minutes' => (int) env('EMAILS_QUEUE_RETRY_BACKOFF_MINUTES', 5),

    // Throttle: seconds to sleep between consecutive sends in a single emails:process batch.
    // 0 disables throttling.
    'send_delay_seconds' => (int) env('EMAILS_QUEUE_SEND_DELAY_SECONDS', 5),
];
