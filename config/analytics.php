<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Analytics Cache TTL (minutes)
    |--------------------------------------------------------------------------
    |
    | How long analytics queries are cached, in minutes.
    | Set to 0 to disable caching entirely.
    |
    */
    'cache_ttl' => (int) env('ANALYTICS_CACHE_TTL', 5),
];