<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\EmailMessage;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\User;

class FirstProductHandlerTest extends ManagerNotificationTestCase
{
    private ManagerNotification $notification;

    protected function setUp(): void
    {
        parent::setUp();

        $this->notification = $this->notification(ManagerNotification::KEY_FIRST_PRODUCT);
    }

    public function test_waits_three_full_days_after_password_set(): void
    {
        // Пароль задан в понедельник днём: три полных дня — вт, ср, чт.
        $manager = $this->manager($this->minsk('2026-10-05 15:00'));
        $brand = $this->brand($manager, $this->minsk('2026-10-01 10:00'));

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-08 23:00')));

        $candidates = $this->candidates($this->notification, $this->minsk('2026-10-09 10:00'));
        $this->assertCount(1, $candidates);
        $this->assertTrue($candidates->first()->brand->is($brand));
        $this->assertSame(1, $candidates->first()->sequence);
    }

    public function test_days_are_counted_by_minsk_calendar_not_utc(): void
    {
        // Понедельник 01:00 по Минску — это ещё воскресенье по UTC.
        $manager = $this->manager($this->minsk('2026-10-05 01:00'));
        $this->brand($manager, $this->minsk('2026-10-01 10:00'));

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-08 23:59')));
        $this->assertCount(1, $this->candidates($this->notification, $this->minsk('2026-10-09 00:00')));
    }

    public function test_drafts_do_not_count_but_a_published_product_does(): void
    {
        $manager = $this->manager($this->minsk('2026-10-05 10:00'));
        $withDraft = $this->brand($manager, $this->minsk('2026-10-01 10:00'), 'Drafts only');
        $this->product($withDraft, $this->minsk('2026-10-06 10:00'), enabled: false);

        $other = $this->manager($this->minsk('2026-10-05 10:00'));
        $published = $this->brand($other, $this->minsk('2026-10-01 10:00'), 'Published');
        $this->product($published, $this->minsk('2026-10-06 10:00'));

        $brands = $this->candidates($this->notification, $this->minsk('2026-10-09 10:00'))
            ->map(fn ($c) => $c->brand->name)->all();

        $this->assertSame(['Drafts only'], $brands);
    }

    public function test_is_sent_only_once_and_queues_the_email(): void
    {
        $manager = $this->manager($this->minsk('2026-10-05 10:00'));
        $brand = $this->brand($manager, $this->minsk('2026-10-01 10:00'), 'Linen Lab');

        $this->assertCount(1, $this->dispatchAt($this->notification, $this->minsk('2026-10-09 10:00')));
        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-10-10 10:00')));
        $this->assertCount(0, $this->dispatchAt($this->notification, $this->minsk('2026-11-20 10:00')));

        $delivery = $this->deliveriesFor($this->notification, $brand)->sole();
        $this->assertSame(ManagerNotificationDelivery::TRIGGER_AUTO, $delivery->trigger);
        $this->assertSame($manager->id, $delivery->user_id);

        $email = EmailMessage::findOrFail($delivery->email_message_id);
        $this->assertSame('manager_first_product', $email->template_key);
        $this->assertSame($manager->email, $email->to_email);
        $this->assertSame('Ваш первый товар на spraby', $email->subject);
        $this->assertSame('Linen Lab', $email->payload['brand_name']);
        $this->assertStringEndsWith('/admin/products/create', $email->payload['button_url']);
    }

    public function test_a_brand_created_later_counts_from_its_own_creation(): void
    {
        $manager = $this->manager($this->minsk('2026-06-01 10:00'));
        $this->brand($manager, $this->minsk('2026-10-05 10:00'));

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-08 10:00')));
        $this->assertCount(1, $this->candidates($this->notification, $this->minsk('2026-10-09 10:00')));
    }

    public function test_each_brand_of_a_manager_is_handled_separately(): void
    {
        $manager = $this->manager($this->minsk('2026-10-05 10:00'));
        $empty = $this->brand($manager, $this->minsk('2026-10-01 10:00'), 'Empty');
        $busy = $this->brand($manager, $this->minsk('2026-10-01 10:00'), 'Busy');
        $this->product($busy, $this->minsk('2026-10-06 10:00'));

        $candidates = $this->candidates($this->notification, $this->minsk('2026-10-09 10:00'));

        $this->assertCount(1, $candidates);
        $this->assertTrue($candidates->first()->brand->is($empty));
    }

    public function test_skips_managers_without_password_and_non_managers(): void
    {
        $noPassword = $this->manager(null);
        $this->brand($noPassword, $this->minsk('2026-10-01 10:00'));

        $notManager = User::factory()->create();
        $notManager->forceFill(['password_set_at' => $this->minsk('2026-10-01 10:00')])->save();
        $this->brand($notManager, $this->minsk('2026-10-01 10:00'));

        $this->assertCount(0, $this->candidates($this->notification, $this->minsk('2026-10-20 10:00')));
    }

    public function test_manual_send_does_not_block_the_automatic_one(): void
    {
        $manager = $this->manager($this->minsk('2026-10-05 10:00'));
        $brand = $this->brand($manager, $this->minsk('2026-10-01 10:00'));

        ManagerNotificationDelivery::create([
            'manager_notification_id' => $this->notification->id,
            'brand_id' => $brand->id,
            'user_id' => $manager->id,
            'trigger' => ManagerNotificationDelivery::TRIGGER_MANUAL,
        ]);

        $this->assertCount(1, $this->candidates($this->notification, $this->minsk('2026-10-09 10:00')));
    }
}
