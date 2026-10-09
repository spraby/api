<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'secret-pass-123';

    private function makeUser(): User
    {
        return User::factory()->create(['password' => bcrypt(self::PASSWORD)]);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = $this->makeUser();

        $this->post('/admin/login', ['email' => $user->email, 'password' => self::PASSWORD])
            ->assertRedirect(route('admin.dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
    }

    public function test_remember_me_sets_a_remember_token(): void
    {
        $user = $this->makeUser();

        $this->post('/admin/login', ['email' => $user->email, 'password' => self::PASSWORD, 'remember' => true])
            ->assertRedirect(route('admin.dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->getRememberToken());
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = $this->makeUser();

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_is_throttled_after_repeated_failures(): void
    {
        $user = $this->makeUser();

        foreach (range(1, 5) as $attempt) {
            $this->post('/admin/login', ['email' => $user->email, 'password' => 'wrong-password']);
        }

        // Even the right password is refused while locked out.
        $this->post('/admin/login', ['email' => $user->email, 'password' => self::PASSWORD])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->post('/admin/logout')
            ->assertRedirect(route('admin.login'));

        $this->assertGuest();
    }

    public function test_self_registration_is_not_available(): void
    {
        $this->get('/admin/register')->assertNotFound();
        $this->post('/admin/register', [
            'name' => 'X',
            'email' => 'x@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertNotFound();

        $this->assertDatabaseMissing('users', ['email' => 'x@example.com']);
    }
}
