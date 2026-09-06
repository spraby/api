<?php

namespace Tests\Feature;

use App\Models\Settings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SettingsInformationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('manager')->syncPermissions(User::MANAGER_PERMISSIONS);
        Role::findOrCreate('admin')->syncPermissions(User::ADMIN_PERMISSIONS);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function manager(): User
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        return $manager;
    }

    public function test_admin_can_create_information_text(): void
    {
        $response = $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => '<p>Текст витрины</p>',
            ]);

        $response->assertRedirect();

        $settings = Settings::information()->first();
        $this->assertNotNull($settings);
        $this->assertSame('<p>Текст витрины</p>', $settings->data['description']);
    }

    public function test_admin_can_update_existing_information_text(): void
    {
        Settings::createInformation(['description' => '<p>Старый</p>']);

        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => '<p>Новый</p>',
            ])
            ->assertRedirect();

        $this->assertSame(1, Settings::information()->count());
        $this->assertSame('<p>Новый</p>', Settings::information()->first()->data['description']);
    }

    public function test_empty_editor_markup_is_stored_as_empty_string(): void
    {
        Settings::createInformation(['description' => '<p>Старый</p>']);

        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => '<p><br></p>',
            ])
            ->assertRedirect();

        $this->assertSame('', Settings::information()->first()->data['description']);
    }

    public function test_manager_cannot_update_information_text(): void
    {
        $this->actingAs($this->manager())
            ->put(route('admin.settings.information.update'), [
                'description' => '<p>Текст</p>',
            ])
            ->assertForbidden();

        $this->assertNull(Settings::information()->first());
    }

    public function test_entities_only_markup_is_stored_as_empty_string(): void
    {
        Settings::createInformation(['description' => '<p>Старый</p>']);

        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => '<p>&nbsp;&nbsp;</p>',
            ])
            ->assertRedirect();

        $this->assertSame('', Settings::information()->first()->data['description']);
    }

    public function test_too_long_text_is_rejected(): void
    {
        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => str_repeat('a', 5001),
            ])
            ->assertSessionHasErrors('description');

        $this->assertNull(Settings::information()->first());
    }

    public function test_limit_counts_visible_text_not_markup(): void
    {
        // 700 видимых символов, но 17500 символов разметки: старое правило
        // (max:5000 по HTML) отвергло бы такой текст.
        $description = str_repeat('<p><strong>a</strong></p>', 700);
        $this->assertGreaterThan(5000, mb_strlen($description));
        $this->assertLessThanOrEqual(20000, mb_strlen($description));

        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), ['description' => $description])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame($description, Settings::information()->first()->data['description']);
    }

    public function test_oversized_markup_is_rejected(): void
    {
        $this->actingAs($this->admin())
            ->put(route('admin.settings.information.update'), [
                'description' => str_repeat('<p><strong>a</strong></p>', 1000),
            ])
            ->assertSessionHasErrors('description');

        $this->assertNull(Settings::information()->first());
    }

    public function test_admin_settings_page_exposes_information_text(): void
    {
        Settings::createInformation(['description' => '<p>Текст витрины</p>']);

        $this->actingAs($this->admin())
            ->get(route('admin.settings'))
            ->assertInertia(fn ($page) => $page
                ->where('information', '<p>Текст витрины</p>')
                ->where('informationMaxLength', 5000));
    }
}
