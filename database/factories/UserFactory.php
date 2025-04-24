<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 *
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'role' => 'manager',
            'password' => bcrypt('12qw34er')
        ];
    }

    public function admin(): Factory
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function customer(): Factory
    {
        return $this->state(fn () => ['role' => 'customer']);
    }
}
