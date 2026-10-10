<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('emails:process')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('brand-requests:notify')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

// Оповещения менеджеров: каждый вид срабатывает в свой час (send_hour, Минск).
// Блокировка короче часа: если процесс убьют посреди запуска, она не
// пропустит следующие запуски (по умолчанию висела бы сутки).
Schedule::command('manager-notifications:dispatch')
    ->hourly()
    ->withoutOverlapping(55);
