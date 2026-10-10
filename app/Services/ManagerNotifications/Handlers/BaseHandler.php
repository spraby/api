<?php

namespace App\Services\ManagerNotifications\Handlers;

use App\Models\Brand;
use App\Models\ManagerNotification;
use App\Models\User;
use App\Services\ManagerNotifications\ManagerNotificationHandler;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

abstract class BaseHandler implements ManagerNotificationHandler
{
    /**
     * Бренды, чьим владельцам вообще можно слать оповещения.
     *
     * @return Builder<Brand>
     */
    protected function brands(): Builder
    {
        return Brand::query()
            ->whereNotNull('user_id')
            ->whereHas('user', fn (Builder $q) => $q->notifiableManagers())
            ->with('user');
    }

    /**
     * Сколько полных календарных дней по Минску прошло после события: событие
     * в понедельник, сейчас пятница — 3 (вт, ср, чт). Время суток не важно,
     * поэтому письмо не «уезжает» из-за того, в котором часу было событие.
     * Все сроки в conditions считаются в полных днях.
     */
    protected function fullDaysSince(CarbonInterface $from, CarbonInterface $now): int
    {
        $start = Carbon::instance($from)->setTimezone(ManagerNotification::TIMEZONE)->startOfDay();
        $end = Carbon::instance($now)->setTimezone(ManagerNotification::TIMEZONE)->startOfDay();

        return max(0, (int) $start->diffInDays($end, false) - 1);
    }

    /**
     * Самая поздняя из дат: отсчёт идёт от последнего значимого события
     * (пароль задан, бренд создан, появился товар).
     */
    protected function latest(?CarbonInterface ...$dates): ?CarbonInterface
    {
        $dates = array_filter($dates);

        return $dates ? max($dates) : null;
    }

    /** Отсчёт по бренду начинается не раньше, чем владелец задал пароль. */
    protected function brandStart(Brand $brand): ?CarbonInterface
    {
        /** @var User $user */
        $user = $brand->user;

        return $this->latest($user->password_set_at, $brand->created_at);
    }
}
