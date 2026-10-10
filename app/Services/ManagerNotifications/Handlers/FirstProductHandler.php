<?php

namespace App\Services\ManagerNotifications\Handlers;

use App\Models\Brand;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Services\ManagerNotifications\Candidate;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * «Ваш первый товар»: через N полных дней после установки пароля (или создания
 * бренда, если он появился позже) у бренда всё ещё нет опубликованных товаров.
 * Черновики (enabled = false) за товары не считаются.
 *
 * conditions: days_after_password_set, max_published_products, send_once.
 */
class FirstProductHandler extends BaseHandler
{
    public function candidates(ManagerNotification $notification, CarbonInterface $now): Collection
    {
        $days = (int) $notification->condition('days_after_password_set', 3);
        $maxPublished = (int) $notification->condition('max_published_products', 0);
        $sendOnce = (bool) $notification->condition('send_once', true);

        $published = fn ($q) => $q->where('enabled', true);

        // Опубликованных товаров не больше порога — считаем в SQL.
        $query = $this->brands()->whereHas('products', $published, '<=', $maxPublished);

        if ($sendOnce) {
            $query->whereNotIn('brands.id', ManagerNotificationDelivery::query()
                ->auto()
                ->where('manager_notification_id', $notification->id)
                ->select('brand_id'));
        }

        return $query->get()
            ->map(function (Brand $brand) use ($days, $now) {
                $anchor = $this->brandStart($brand);

                // «3 полных дня»: событие в понедельник — письмо в пятницу.
                if (! $anchor || $this->fullDaysSince($anchor, $now) < $days) {
                    return null;
                }

                return new Candidate($brand, $anchor, 1);
            })
            ->filter()
            ->values();
    }

    public function template(): string
    {
        return 'manager_first_product';
    }

    public function subject(): string
    {
        return 'Ваш первый товар на spraby';
    }

    public function preheader(): string
    {
        return 'Начните с одной работы — остальные можно добавить позже.';
    }

    public function describe(ManagerNotification $notification): array
    {
        $prefix = 'admin.manager_notifications.conditions.first_product';
        $days = (int) $notification->condition('days_after_password_set', 3);
        $maxPublished = (int) $notification->condition('max_published_products', 0);

        return array_values(array_filter([
            trans_choice("{$prefix}.days", $days, ['days' => $days]),
            trans_choice("{$prefix}.max_published", $maxPublished, ['count' => $maxPublished]),
            $notification->condition('send_once', true) ? __("{$prefix}.send_once") : null,
        ]));
    }
}
