<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Settings;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Settings::create([
            'id' => 'global',
            'data' => [
                'site_name' => 'Spraby App',
                'maintenance' => false,
            ],
        ]);
    }
}
