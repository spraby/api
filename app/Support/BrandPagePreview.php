<?php

namespace App\Support;

use App\Models\Brand;

/**
 * Подписанная ссылка на неопубликованную страницу бренда.
 *
 * У витрины своя сессия, и ролей админки она не знает, поэтому доступ к превью
 * даёт не авторизация, а подпись общим секретом с ограниченным сроком жизни.
 */
class BrandPagePreview
{
    /** Сколько живёт ссылка: хватит посмотреть, мало, чтобы разойтись по рукам. */
    public const TTL_SECONDS = 1800;

    public static function url(Brand $brand): ?string
    {
        $url = $brand->pageUrl();

        if (! $url || ! self::secret()) {
            return null;
        }

        $expiresAt = now()->getTimestamp() + self::TTL_SECONDS;

        return $url.'?preview='.$expiresAt.'.'.self::signature((string) $brand->domain, $expiresAt);
    }

    public static function signature(string $handle, int $expiresAt): string
    {
        return hash_hmac('sha256', $handle.':'.$expiresAt, (string) self::secret());
    }

    private static function secret(): ?string
    {
        return config('app.brand_preview_secret') ?: null;
    }
}
