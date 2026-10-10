<?php

namespace App\Services\ManagerNotifications;

use App\Models\ManagerNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Логика одного вида оповещения: кому слать и каким письмом.
 * Новый вид — новый обработчик плюс строка в ManagerNotificationRegistry.
 */
interface ManagerNotificationHandler
{
    /**
     * Бренды, которым письмо положено прямо сейчас.
     *
     * @return Collection<int, Candidate>
     */
    public function candidates(ManagerNotification $notification, CarbonInterface $now): Collection;

    /** Ключ Blade-шаблона в resources/views/emails. */
    public function template(): string;

    public function subject(): string;

    public function preheader(): string;

    /**
     * Условия срабатывания человеческим языком — для страницы в админке.
     *
     * @return list<string>
     */
    public function describe(ManagerNotification $notification): array;
}
