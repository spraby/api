<?php

namespace Database\Seeders;

use App\Models\Settings;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Settings::firstOrCreate(
            ['key' => 'global'],
            [
                'data' => [
                    'site_name' => 'Spraby App',
                    'maintenance' => false,
                ],
            ],
        );
    }
}
