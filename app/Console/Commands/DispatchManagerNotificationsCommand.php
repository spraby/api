<?php

namespace App\Console\Commands;

use App\Models\ManagerNotification;
use App\Services\ManagerNotifications\ManagerNotificationDispatcher;
use App\Services\ManagerNotifications\ManagerNotificationRegistry;
use Illuminate\Console\Command;

/**
 * Раз в час: для каждого включённого оповещения, чей час отправки наступил,
 * выбрать бренды по условиям и поставить им письма в очередь. Отправляет
 * их уже emails:process.
 */
class DispatchManagerNotificationsCommand extends Command
{
    protected $signature = 'manager-notifications:dispatch
        {--force : Process every enabled notification now, ignoring send_hour}';

    protected $description = 'Queue manager notification emails whose send hour has come';

    public function handle(ManagerNotificationRegistry $registry, ManagerNotificationDispatcher $dispatcher): int
    {
        $now = now();
        $hour = $now->copy()->setTimezone(ManagerNotification::TIMEZONE)->hour;

        $notifications = ManagerNotification::query()
            ->where('enabled', true)
            ->when(! $this->option('force'), fn ($q) => $q->where('send_hour', $hour))
            ->orderBy('id')
            ->get();

        $failed = false;

        foreach ($notifications as $notification) {
            if (! $registry->has($notification)) {
                $this->warn("Skipping [{$notification->key}]: no handler.");

                continue;
            }

            // Сбой одного вида (выборка, БД) не должен лишать писем остальные.
            try {
                $candidates = $registry->handler($notification)->candidates($notification, $now);
            } catch (\Throwable $e) {
                report($e);
                $this->error("[{$notification->key}] selection failed: {$e->getMessage()}");
                $failed = true;

                continue;
            }

            $queued = 0;
            foreach ($candidates as $candidate) {
                try {
                    if ($dispatcher->dispatchCandidate($notification, $candidate)) {
                        $queued++;
                    }
                } catch (\Throwable $e) {
                    // Один сломанный бренд не должен останавливать рассылку остальным.
                    report($e);
                    $this->error("[{$notification->key}] brand #{$candidate->brand->id}: {$e->getMessage()}");
                    $failed = true;
                }
            }

            $this->info("[{$notification->key}] queued {$queued} email(s).");
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
