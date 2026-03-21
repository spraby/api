<?php

namespace App\Services\Analytics;

use Illuminate\Support\Facades\Cache;

trait CachesAnalytics
{
    /**
     * Run a query with optional caching controlled by ANALYTICS_CACHE_TTL env variable.
     * Set to 0 to disable caching entirely. Default: 5 (minutes).
     */
    protected function cached(string $key, callable $callback): mixed
    {
        $ttl = (int) config('analytics.cache_ttl', 5);

        if ($ttl <= 0) {
            return $callback();
        }

        return Cache::remember($key, now()->addMinutes($ttl), $callback);
    }
}