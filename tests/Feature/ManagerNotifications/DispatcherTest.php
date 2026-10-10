<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\EmailMessage;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Services\ManagerNotifications\Candidate;
use App\Services\ManagerNotifications\ManagerNotificationDispatcher;

class DispatcherTest extends ManagerNotificationTestCase
{
    public function test_the_same_event_is_queued_once_and_the_duplicate_email_is_rolled_back(): void
    {
        $notification = $this->notification(ManagerNotification::KEY_FIRST_PRODUCT);
        $brand = $this->brand($this->manager($this->minsk('2026-10-01 10:00')));
        $candidate = new Candidate($brand, $this->minsk('2026-10-01 10:00'), 1);

        $dispatcher = app(ManagerNotificationDispatcher::class);

        // Два параллельных запуска посчитали одно и то же событие — их
        // разводит уникальный индекс, а не логика выборки.
        $this->assertNotNull($dispatcher->dispatchCandidate($notification, $candidate));
        $this->assertNull($dispatcher->dispatchCandidate($notification, $candidate));

        $this->assertSame(1, ManagerNotificationDelivery::count());
        $this->assertSame(1, EmailMessage::count());
    }
}
