<?php

namespace App\Services\ManagerNotifications;

use App\Models\ManagerNotification;
use App\Services\ManagerNotifications\Handlers\CatalogInactivityHandler;
use App\Services\ManagerNotifications\Handlers\FirstProductHandler;
use InvalidArgumentException;

/**
 * Какой обработчик отвечает за какой вид оповещения (по manager_notifications.key).
 */
class ManagerNotificationRegistry
{
    private const HANDLERS = [
        ManagerNotification::KEY_FIRST_PRODUCT => FirstProductHandler::class,
        ManagerNotification::KEY_CATALOG_INACTIVITY => CatalogInactivityHandler::class,
    ];

    public function has(ManagerNotification $notification): bool
    {
        return isset(self::HANDLERS[$notification->key]);
    }

    public function handler(ManagerNotification $notification): ManagerNotificationHandler
    {
        $class = self::HANDLERS[$notification->key]
            ?? throw new InvalidArgumentException("No handler for manager notification [{$notification->key}].");

        return app($class);
    }
}
