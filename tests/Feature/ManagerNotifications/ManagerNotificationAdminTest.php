<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\EmailMessage;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class ManagerNotificationAdminTest extends ManagerNotificationTestCase
{
    private User $admin;

    private ManagerNotification $notification;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->admin();
        $this->notification = $this->notification(ManagerNotification::KEY_FIRST_PRODUCT);
    }

    private function url(string $suffix = ''): string
    {
        return "/admin/manager-notifications/{$this->notification->id}{$suffix}";
    }

    public function test_managers_have_no_access(): void
    {
        $manager = $this->manager($this->minsk('2026-10-01 10:00'));

        $this->actingAs($manager)->get('/admin/manager-notifications')->assertForbidden();
        $this->actingAs($manager)->get($this->url())->assertForbidden();
        $this->actingAs($manager)->put($this->url(), ['send_hour' => 5, 'enabled' => false])->assertForbidden();
        $this->actingAs($manager)->post($this->url('/send'), ['brand_ids' => [1]])->assertForbidden();
        $this->actingAs($manager)->get($this->url('/recipients'))->assertForbidden();
        $this->actingAs($manager)->get($this->url('/deliveries?before_id=1'))->assertForbidden();
    }

    public function test_admin_with_read_permission_only_cannot_change_anything(): void
    {
        Role::findByName('admin')->revokePermissionTo(User::PERMISSIONS['WRITE_MANAGER_NOTIFICATIONS']);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->actingAs($this->admin)->get($this->url())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('canEdit', false));

        $this->actingAs($this->admin)->put($this->url(), ['send_hour' => 5, 'enabled' => false])->assertForbidden();
        $this->actingAs($this->admin)->get($this->url('/recipients'))->assertForbidden();
        $this->actingAs($this->admin)->post($this->url('/send'), ['brand_ids' => [1]])->assertForbidden();
    }

    public function test_index_lists_both_notifications(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/manager-notifications')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ManagerNotifications', false)
                ->has('notifications', 2)
                ->where('notifications.0.key', 'first_product')
                ->where('notifications.0.send_hour', 10));
    }

    public function test_show_describes_conditions_and_renders_the_preview(): void
    {
        $this->actingAs($this->admin)
            ->get($this->url())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ManagerNotificationShow', false)
                ->where('notification.subject', 'Ваш первый товар на spraby')
                ->has('notification.conditions_text', 3)
                ->where('previewHtml', fn (?string $html) => $html !== null
                    && str_contains($html, 'Покажите свою работу')
                    && str_contains($html, 'Начните с одной работы'))
                ->where('canEdit', true));
    }

    public function test_admin_can_change_hour_and_toggle(): void
    {
        $this->actingAs($this->admin)
            ->put($this->url(), ['send_hour' => 18, 'enabled' => false])
            ->assertSessionHasNoErrors();

        $fresh = $this->notification->fresh();
        $this->assertSame(18, $fresh->send_hour);
        $this->assertFalse($fresh->enabled);

        $this->actingAs($this->admin)
            ->put($this->url(), ['send_hour' => 24, 'enabled' => true])
            ->assertSessionHasErrors('send_hour');
    }

    public function test_deliveries_are_paged_by_ten_with_a_cursor(): void
    {
        $manager = $this->manager($this->minsk('2026-10-01 10:00'));
        $brand = $this->brand($manager);

        foreach (range(1, 12) as $i) {
            ManagerNotificationDelivery::create([
                'manager_notification_id' => $this->notification->id,
                'brand_id' => $brand->id,
                'user_id' => $manager->id,
                'trigger' => ManagerNotificationDelivery::TRIGGER_MANUAL,
                'sent_by_user_id' => $this->admin->id,
            ]);
        }

        // Десятая по новизне — последняя строка первой порции.
        $lastShownId = ManagerNotificationDelivery::orderByDesc('id')->skip(9)->value('id');

        $this->actingAs($this->admin)->get($this->url())
            ->assertInertia(fn (Assert $page) => $page
                ->has('deliveries.items', 10)
                ->where('deliveries.has_more', true)
                ->where('deliveries.items.9.id', $lastShownId));

        // Новая отправка между нажатиями «Ещё» не сдвигает следующую порцию.
        ManagerNotificationDelivery::create([
            'manager_notification_id' => $this->notification->id,
            'brand_id' => $brand->id,
            'user_id' => $manager->id,
            'trigger' => ManagerNotificationDelivery::TRIGGER_MANUAL,
        ]);

        $this->actingAs($this->admin)->getJson($this->url("/deliveries?before_id={$lastShownId}"))
            ->assertOk()
            ->assertJsonCount(2, 'items')
            ->assertJsonPath('has_more', false);
    }

    public function test_recipients_search_and_sent_today_flag(): void
    {
        $alice = $this->manager($this->minsk('2026-10-01 10:00'));
        $alice->forceFill(['first_name' => 'Alice', 'last_name' => 'Smith', 'email' => 'alice@example.com'])->save();
        $aliceBrand = $this->brand($alice, null, 'Alice Ceramics');
        $bob = $this->manager($this->minsk('2026-10-01 10:00'));
        $bob->forceFill(['first_name' => 'Robert', 'last_name' => 'Stone', 'email' => 'rob@example.com'])->save();
        $this->brand($bob, null, 'Bob Leather');
        $this->brand($this->manager(null), null, 'No Password Brand');

        ManagerNotificationDelivery::create([
            'manager_notification_id' => $this->notification->id,
            'brand_id' => $aliceBrand->id,
            'user_id' => $alice->id,
            'trigger' => ManagerNotificationDelivery::TRIGGER_AUTO,
            'anchor_at' => now()->subDays(5),
            'sequence' => 1,
        ]);

        $this->actingAs($this->admin)->getJson($this->url('/recipients'))
            ->assertOk()
            ->assertJsonCount(2, 'recipients')
            ->assertJsonPath('recipients.0.brand_name', 'Alice Ceramics')
            ->assertJsonPath('recipients.0.sent_today', true)
            ->assertJsonPath('recipients.1.sent_today', false);

        // Поиск без учёта регистра: по бренду, имени и email владельца.
        $this->actingAs($this->admin)->getJson($this->url('/recipients?search=bob'))
            ->assertJsonCount(1, 'recipients')
            ->assertJsonPath('recipients.0.brand_name', 'Bob Leather');
        $this->actingAs($this->admin)->getJson($this->url('/recipients?search=STONE'))
            ->assertJsonCount(1, 'recipients')
            ->assertJsonPath('recipients.0.brand_name', 'Bob Leather');
        $this->actingAs($this->admin)->getJson($this->url('/recipients?search=alice@example'))
            ->assertJsonCount(1, 'recipients')
            ->assertJsonPath('recipients.0.brand_name', 'Alice Ceramics');

        // % и _ — обычные символы, а не шаблон «всё подряд».
        $this->actingAs($this->admin)->getJson($this->url('/recipients?search=%25'))
            ->assertJsonCount(0, 'recipients');
    }

    public function test_manual_send_queues_emails_regardless_of_conditions_and_when_disabled(): void
    {
        $this->notification->update(['enabled' => false]);

        // У бренда опубликованный товар — по условиям письмо не положено.
        $manager = $this->manager($this->minsk('2026-10-08 10:00'));
        $brand = $this->brand($manager);
        $this->product($brand, now());

        $this->actingAs($this->admin)
            ->post($this->url('/send'), ['brand_ids' => [$brand->id]])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $delivery = $this->deliveriesFor($this->notification, $brand)->sole();
        $this->assertSame(ManagerNotificationDelivery::TRIGGER_MANUAL, $delivery->trigger);
        $this->assertSame($this->admin->id, $delivery->sent_by_user_id);
        $this->assertNull($delivery->anchor_at);
        $this->assertSame('manager_first_product', EmailMessage::findOrFail($delivery->email_message_id)->template_key);

        // Повторная ручная отправка разрешена — на неё только предупреждение в UI.
        $this->actingAs($this->admin)->post($this->url('/send'), ['brand_ids' => [$brand->id]]);
        $this->assertCount(2, $this->deliveriesFor($this->notification, $brand));
    }

    public function test_manual_send_rejects_unknown_or_non_notifiable_brands(): void
    {
        $ok = $this->brand($this->manager($this->minsk('2026-10-01 10:00')));
        $noPassword = $this->brand($this->manager(null));

        $this->actingAs($this->admin)
            ->post($this->url('/send'), ['brand_ids' => [$ok->id, $noPassword->id]])
            ->assertSessionHasErrors('brand_ids');

        $this->actingAs($this->admin)
            ->post($this->url('/send'), ['brand_ids' => [999999]])
            ->assertSessionHasErrors('brand_ids');

        $this->assertSame(0, ManagerNotificationDelivery::count());
        $this->assertSame(0, EmailMessage::count());
    }

    public function test_manual_send_for_a_notification_without_handler_is_not_found(): void
    {
        $id = DB::table('manager_notifications')->insertGetId([
            'key' => 'retired_type',
            'name' => 'Retired',
            'conditions' => '{}',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $brand = $this->brand($this->manager($this->minsk('2026-10-01 10:00')));

        $this->actingAs($this->admin)
            ->post("/admin/manager-notifications/{$id}/send", ['brand_ids' => [$brand->id]])
            ->assertNotFound();

        $this->assertSame(0, EmailMessage::count());
    }
}
