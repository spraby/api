<?php

namespace App\Services\ManagerNotifications\Handlers;

use App\Models\Brand;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Services\ManagerNotifications\Candidate;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * «Пополните каталог»: бренд с товарами давно не добавлял новых.
 *
 * Точка отсчёта — последнее из: пароль задан, бренд создан, последний
 * товар. Новая точка (появился товар) — новый цикл: письмо через
 * inactive_days полных дней. Та же точка — повтор через repeat_every_days
 * полных дней после прошлого письма. Учитываются только автоматические
 * отправки. Бренды без опубликованных товаров отсекает min_published_products.
 *
 * conditions: min_products, min_published_products, count_drafts,
 * inactive_days, repeat_every_days.
 */
class CatalogInactivityHandler extends BaseHandler
{
    public function candidates(ManagerNotification $notification, CarbonInterface $now): Collection
    {
        $minProducts = (int) $notification->condition('min_products', 1);
        $minPublished = (int) $notification->condition('min_published_products', 1);
        $countDrafts = (bool) $notification->condition('count_drafts', true);
        $inactiveDays = (int) $notification->condition('inactive_days', 14);
        $repeatDays = (int) $notification->condition('repeat_every_days', 28);

        $counted = fn ($q) => $countDrafts ? $q : $q->where('enabled', true);
        $published = fn ($q) => $q->where('enabled', true);

        // Пороги по товарам — в SQL. Брендам без опубликованных товаров
        // это письмо не шлём: их ведёт «Первый товар».
        $brands = $this->brands()
            ->whereHas('products', $counted, '>=', $minProducts)
            ->whereHas('products', $published, '>=', $minPublished)
            ->withMax(['products as last_product_at' => $counted], 'created_at')
            ->get();

        // Последняя автоматическая отправка по каждому бренду — одним запросом,
        // без загрузки всей истории.
        $lastSent = ManagerNotificationDelivery::query()
            ->whereIn('id', ManagerNotificationDelivery::query()
                ->auto()
                ->where('manager_notification_id', $notification->id)
                ->selectRaw('max(id)')
                ->groupBy('brand_id'))
            ->get()
            ->keyBy('brand_id');

        return $brands
            ->map(function (Brand $brand) use ($lastSent, $now, $inactiveDays, $repeatDays) {
                $anchor = $this->latest(
                    $this->brandStart($brand),
                    $brand->last_product_at ? Carbon::parse($brand->last_product_at) : null,
                );

                if (! $anchor) {
                    return null;
                }

                /** @var ManagerNotificationDelivery|null $previous */
                $previous = $lastSent->get($brand->id);

                // Новый цикл: писем ещё не было или после прошлого появился товар.
                if (! $previous || $previous->anchor_at->lt($anchor)) {
                    return $this->fullDaysSince($anchor, $now) >= $inactiveDays
                        ? new Candidate($brand, $anchor, 1)
                        : null;
                }

                // Тот же цикл: повтор, если с прошлого письма прошло достаточно.
                return $this->fullDaysSince($previous->created_at, $now) >= $repeatDays
                    ? new Candidate($brand, $previous->anchor_at, $previous->sequence + 1)
                    : null;
            })
            ->filter()
            ->values();
    }

    public function template(): string
    {
        return 'manager_catalog_inactivity';
    }

    public function subject(): string
    {
        return 'Добавьте новые работы на spraby';
    }

    public function preheader(): string
    {
        return 'Покажите новинки и изделия, которые можете изготовить под заказ.';
    }

    public function describe(ManagerNotification $notification): array
    {
        $prefix = 'admin.manager_notifications.conditions.catalog_inactivity';
        $minProducts = (int) $notification->condition('min_products', 1);
        $minPublished = (int) $notification->condition('min_published_products', 1);
        $inactiveDays = (int) $notification->condition('inactive_days', 14);
        $repeatDays = (int) $notification->condition('repeat_every_days', 28);
        $countDrafts = (bool) $notification->condition('count_drafts', true);

        return [
            trans_choice("{$prefix}.min_products", $minProducts, ['count' => $minProducts]),
            trans_choice("{$prefix}.min_published", $minPublished, ['count' => $minPublished]),
            __($countDrafts ? "{$prefix}.count_drafts" : "{$prefix}.published_only"),
            trans_choice("{$prefix}.inactive_days", $inactiveDays, ['days' => $inactiveDays]),
            trans_choice("{$prefix}.repeat", $repeatDays, ['days' => $repeatDays]),
            __("{$prefix}.reset"),
        ];
    }
}
