<?php

namespace Tests\Feature\ManagerNotifications;

use App\Models\Brand;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\Product;
use App\Models\User;
use App\Services\ManagerNotifications\Candidate;
use App\Services\ManagerNotifications\ManagerNotificationDispatcher;
use App\Services\ManagerNotifications\ManagerNotificationRegistry;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

abstract class ManagerNotificationTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('admin')->syncPermissions(User::ADMIN_PERMISSIONS);
        Role::findOrCreate('manager')->syncPermissions(User::MANAGER_PERMISSIONS);
    }

    /** Момент по Минску, например minsk('2026-10-05 12:00'). */
    protected function minsk(string $datetime): Carbon
    {
        return Carbon::parse($datetime, ManagerNotification::TIMEZONE)->utc();
    }

    protected function notification(string $key): ManagerNotification
    {
        return ManagerNotification::where('key', $key)->sole();
    }

    protected function manager(?CarbonInterface $passwordSetAt): User
    {
        $user = User::factory()->create();
        $user->forceFill(['password_set_at' => $passwordSetAt])->save();
        $user->assignRole('manager');

        return $user;
    }

    protected function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    protected function brand(User $owner, ?CarbonInterface $createdAt = null, string $name = 'Test Brand'): Brand
    {
        $create = fn () => Brand::create(['user_id' => $owner->id, 'name' => $name]);

        return $createdAt ? $this->travelTo($createdAt, $create) : $create();
    }

    protected function product(Brand $brand, CarbonInterface $createdAt, bool $enabled = true): Product
    {
        return $this->travelTo($createdAt, fn () => Product::create([
            'brand_id' => $brand->id,
            'title' => 'Product',
            'enabled' => $enabled,
        ]));
    }

    /** @return Collection<int, Candidate> */
    protected function candidates(ManagerNotification $notification, CarbonInterface $now): Collection
    {
        return app(ManagerNotificationRegistry::class)->handler($notification)->candidates($notification, $now);
    }

    /** Прогнать выборку и поставить письма, как это делает крон. */
    protected function dispatchAt(ManagerNotification $notification, CarbonInterface $now): Collection
    {
        $dispatcher = app(ManagerNotificationDispatcher::class);

        return $this->travelTo($now, fn () => $this->candidates($notification, $now)
            ->map(fn (Candidate $c) => $dispatcher->dispatchCandidate($notification, $c))
            ->filter()
            ->values());
    }

    protected function deliveriesFor(ManagerNotification $notification, Brand $brand): Collection
    {
        return ManagerNotificationDelivery::where('manager_notification_id', $notification->id)
            ->where('brand_id', $brand->id)
            ->orderBy('id')
            ->get();
    }
}
