<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** Viber в «Настройки → Контакты»: сохраняется и удаляется, как остальные контакты. */
class SettingsContactsViberTest extends TestCase
{
    use RefreshDatabase;

    public function test_viber_contact_is_saved_and_removed(): void
    {
        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['MANAGER'])->syncPermissions(User::MANAGER_PERMISSIONS);

        $manager = User::factory()->create();
        $manager->assignRole(User::ROLES['MANAGER']);
        $brand = Brand::create(['user_id' => $manager->id, 'name' => 'Brand']);

        $this->actingAs($manager)
            ->put(route('admin.settings.contacts.update'), ['viber' => '+375 29 387-99-95'])
            ->assertSessionHasNoErrors();

        $this->assertSame(
            '+375 29 387-99-95',
            $brand->contacts()->where('type', Contact::TYPE_VIBER)->value('value'),
        );

        $this->actingAs($manager)
            ->put(route('admin.settings.contacts.update'), ['viber' => null])
            ->assertSessionHasNoErrors();

        $this->assertFalse($brand->contacts()->where('type', Contact::TYPE_VIBER)->exists());
    }
}
