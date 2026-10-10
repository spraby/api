<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Разовый сид при запуске оповещений: менеджерам, которые уже задали пароль,
 * проставляет password_set_at = дата запуска. Сроки оповещений для них пойдут
 * от запуска, а не от давней регистрации — иначе в первый же день письма
 * ушли бы всем разом. Повторный запуск трогает только пустые даты.
 *
 * php artisan db:seed --class=BackfillPasswordSetAtSeeder
 */
class BackfillPasswordSetAtSeeder extends Seeder
{
    public function run(): void
    {
        $updated = User::role(User::ROLES['MANAGER'])
            ->whereNotNull('password')
            ->whereNull('password_set_at')
            ->update(['password_set_at' => now()]);

        $this->command?->info("password_set_at filled for {$updated} manager(s).");
    }
}
