<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
        ]);

        User::factory()->count(3)->create();

        User::factory()->customer()->count(10)->create();
    }
}
