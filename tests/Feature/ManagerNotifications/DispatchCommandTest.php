<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Services\ManagerNotifications\Handlers\FirstProductHandler;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use RuntimeException;

class DispatchCommandTest extends ManagerNotificationTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Бренд без товаров — подходит под «Первый товар».
        $manager = $this->manager($this->minsk('2026-10-01 10:00'));
        $this->brand($manager, $this->minsk('2026-10-01 10:00'));
    }

    private function runAt(string $minskTime, array $options = []): void
    {
        $this->travelTo($this->minsk($minskTime));
        $this->artisan('manager-notifications:dispatch', $options)->assertSuccessful();
        $this->travelBack();
    }

    public function test_runs_only_at_the_send_hour_in_minsk(): void
    {
        // 10:00 по Минску — это 07:00 UTC; в 09:00 по Минску ничего не уходит.
        $this->runAt('2026-10-09 09:00');
        $this->assertSame(0, ManagerNotificationDelivery::count());

        $this->runAt('2026-10-09 10:00');
        $this->assertSame(1, ManagerNotificationDelivery::count());
    }

    public function test_respects_a_changed_send_hour(): void
    {
        $this->notification(ManagerNotification::KEY_FIRST_PRODUCT)->update(['send_hour' => 18]);

        $this->runAt('2026-10-09 10:00');
        $this->assertSame(0, ManagerNotificationDelivery::count());

        $this->runAt('2026-10-09 18:00');
        $this->assertSame(1, ManagerNotificationDelivery::count());
    }

    public function test_skips_disabled_notifications(): void
    {
        $this->notification(ManagerNotification::KEY_FIRST_PRODUCT)->update(['enabled' => false]);

        $this->runAt('2026-10-09 10:00');

        $this->assertSame(0, ManagerNotificationDelivery::count());
    }

    public function test_force_ignores_the_send_hour_and_reruns_create_no_duplicates(): void
    {
        $this->runAt('2026-10-09 03:00', ['--force' => true]);
        $this->runAt('2026-10-09 04:00', ['--force' => true]);

        $this->assertSame(1, ManagerNotificationDelivery::count());
    }

    public function test_a_failing_notification_does_not_stop_the_others(): void
    {
        // Бренд для «Пополните каталог»: опубликованный товар давно.
        $manager = $this->manager($this->minsk('2026-09-01 10:00'));
        $brand = $this->brand($manager, $this->minsk('2026-09-01 10:00'));
        $this->product($brand, $this->minsk('2026-09-02 10:00'));

        $this->app->bind(FirstProductHandler::class, fn () => new class extends FirstProductHandler
        {
            public function candidates(ManagerNotification $notification, CarbonInterface $now): Collection
            {
                throw new RuntimeException('selection failed');
            }
        });

        $this->travelTo($this->minsk('2026-10-09 10:00'));
        $this->artisan('manager-notifications:dispatch')->assertFailed();

        $catalog = $this->notification(ManagerNotification::KEY_CATALOG_INACTIVITY);
        $this->assertSame(1, ManagerNotificationDelivery::where('manager_notification_id', $catalog->id)->count());
    }
}
