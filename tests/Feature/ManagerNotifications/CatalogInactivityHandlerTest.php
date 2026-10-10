<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\Brand;
use App\Models\EmailMessage;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\Product;

/**
 * Сроки — в полных днях по Минску: товар 1 октября, 14 полных дней —
 * со 2-го по 15-е, письмо 16-го. Повтор — через 28 полных дней после письма.
 */
class CatalogInactivityHandlerTest extends ManagerNotificationTestCase
{
    private ManagerNotification $notification;

    protected function setUp(): void
    {
        parent::setUp();

        $this->notification = $this->notification(ManagerNotification::KEY_CATALOG_INACTIVITY);
    }

    /** Бренд с одним опубликованным товаром от 1 октября. */
    private function brandWithProduct(): Brand
    {
        $manager = $this->manager($this->minsk('2026-09-01 10:00'));
        $brand = $this->brand($manager, $this->minsk('2026-09-01 10:00'));
        $this->product($brand, $this->minsk('2026-10-01 12:00'));

        return $brand;
    }

    public function test_brands_without_products_are_left_to_the_first_product_notification(): void
    {
        $manager = $this->manager($this->minsk('2026-09-01 10:00'));
        $this->brand($manager, $this->minsk('2026-09-01 10:00'));

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-12-01 10:00')));
    }

    public function test_brands_with_drafts_only_are_left_to_the_first_product_notification(): void
    {
        $manager = $this->manager($this->minsk('2026-09-01 10:00'));
        $brand = $this->brand($manager, $this->minsk('2026-09-01 10:00'));
        $this->product($brand, $this->minsk('2026-10-01 12:00'), enabled: false);

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-12-01 10:00')));
    }

    public function test_first_email_after_fourteen_full_days_without_new_products(): void
    {
        $this->brandWithProduct();

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-15 23:59')));

        $candidates = $this->candidates($this->notification, $this->minsk('2026-10-16 00:00'));
        $this->assertCount(1, $candidates);
        $this->assertSame(1, $candidates->first()->sequence);
    }

    public function test_drafts_count_as_activity(): void
    {
        $brand = $this->brandWithProduct();
        $this->product($brand, $this->minsk('2026-10-10 10:00'), enabled: false);

        // Черновик 10-го сдвигает отсчёт: письмо 25-го, а не 16-го.
        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-24 10:00')));
        $this->assertCount(1, $this->candidates($this->notification, $this->minsk('2026-10-25 10:00')));
    }

    public function test_drafts_are_ignored_when_count_drafts_is_off(): void
    {
        $this->notification->forceFill([
            'conditions' => [...$this->notification->conditions, 'count_drafts' => false],
        ])->save();

        $brand = $this->brandWithProduct();
        $this->product($brand, $this->minsk('2026-10-10 10:00'), enabled: false);

        $this->assertCount(1, $this->candidates($this->notification, $this->minsk('2026-10-16 10:00')));
    }

    public function test_repeats_after_twenty_eight_full_days_while_nothing_new_appears(): void
    {
        $brand = $this->brandWithProduct();

        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-10-16 10:00')));

        // Письмо 16-го, 28 полных дней — с 17.10 по 13.11, повтор 14 ноября.
        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-10-17 10:00')));
        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-11-13 10:00')));
        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-11-14 10:00')));
        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-12-13 10:00')));

        $this->assertSame([1, 2, 3], $this->deliveriesFor($this->notification, $brand)->pluck('sequence')->all());

        $email = EmailMessage::findOrFail($this->deliveriesFor($this->notification, $brand)->last()->email_message_id);
        $this->assertSame('manager_catalog_inactivity', $email->template_key);
    }

    public function test_a_new_product_restarts_the_countdown(): void
    {
        $brand = $this->brandWithProduct();
        $this->dispatchAt($this->notification, $this->minsk('2026-10-16 10:00'));

        $this->product($brand, $this->minsk('2026-10-20 10:00'));

        // От нового товара снова 14 полных дней, а не 28 от прошлого письма.
        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-11-03 10:00')));
        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-11-04 10:00')));

        $last = $this->deliveriesFor($this->notification, $brand)->last();
        $this->assertSame(1, $last->sequence);
        $this->assertTrue($last->anchor_at->eq($this->minsk('2026-10-20 10:00')));
    }

    public function test_deleting_the_latest_product_keeps_the_current_cycle(): void
    {
        $brand = $this->brandWithProduct();
        $latest = $this->product($brand, $this->minsk('2026-10-05 10:00'));
        $this->dispatchAt($this->notification, $this->minsk('2026-10-20 10:00'));

        // Точка отсчёта откатилась на 1 октября — это не новый цикл.
        Product::whereKey($latest->id)->delete();

        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-10-21 10:00')));
        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-11-18 10:00')));
        $this->assertSame([1, 2], $this->deliveriesFor($this->notification, $brand)->pluck('sequence')->all());
    }

    public function test_running_twice_in_a_row_does_not_duplicate(): void
    {
        $brand = $this->brandWithProduct();

        $this->dispatchAt($this->notification, $this->minsk('2026-10-16 10:00'));
        $this->dispatchAt($this->notification, $this->minsk('2026-10-16 10:30'));

        $this->assertCount(1, $this->deliveriesFor($this->notification, $brand));
        $this->assertSame(1, EmailMessage::where('template_key', 'manager_catalog_inactivity')->count());
    }

    public function test_manual_sends_do_not_shift_the_schedule(): void
    {
        $brand = $this->brandWithProduct();
        $this->dispatchAt($this->notification, $this->minsk('2026-10-16 10:00'));

        $this->travelTo($this->minsk('2026-11-01 10:00'), fn () => ManagerNotificationDelivery::create([
            'manager_notification_id' => $this->notification->id,
            'brand_id' => $brand->id,
            'user_id' => $brand->user_id,
            'trigger' => ManagerNotificationDelivery::TRIGGER_MANUAL,
        ]));

        // Повтор всё равно через 28 полных дней от прошлого автоматического письма.
        $candidate = $this->candidates($this->notification, $this->minsk('2026-11-14 10:00'))->sole();
        $this->assertSame(2, $candidate->sequence);
        $this->assertTrue($candidate->anchorAt->eq($this->minsk('2026-10-01 12:00')));
    }
}
