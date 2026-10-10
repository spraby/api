<?php

namespace App\Services\ManagerNotifications;

use App\Models\Brand;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\User;
use App\Services\EmailQueue;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * Ставит письмо оповещения в общую очередь и записывает отправку. Дальше
 * письмо уходит обычным emails:process. Общий для крона и ручной отправки.
 */
class ManagerNotificationDispatcher
{
    /** Уникальный индекс на deliveries, защищающий от повторной отправки. */
    private const UNIQUE_SEND_INDEX = 'mnd_unique_send';

    public function __construct(
        private readonly EmailQueue $queue,
        private readonly ManagerNotificationRegistry $registry,
    ) {}

    /** Автоматическая отправка по условиям. null — уже отправлено по этому событию. */
    public function dispatchCandidate(ManagerNotification $notification, Candidate $candidate): ?ManagerNotificationDelivery
    {
        return $this->send($notification, $candidate->brand, ManagerNotificationDelivery::TRIGGER_AUTO, [
            'anchor_at' => $candidate->anchorAt,
            'sequence' => $candidate->sequence,
        ]);
    }

    /** Ручная отправка админом, без проверки условий. */
    public function dispatchManual(ManagerNotification $notification, Brand $brand, User $admin): ?ManagerNotificationDelivery
    {
        return $this->send($notification, $brand, ManagerNotificationDelivery::TRIGGER_MANUAL, [
            'sent_by_user_id' => $admin->id,
        ]);
    }

    /**
     * Данные для шаблона письма. Отдельно — чтобы предпросмотр в админке
     * собирался тем же кодом, что и настоящая отправка.
     */
    public function payload(ManagerNotification $notification, ?string $name, string $brandName): array
    {
        $handler = $this->registry->handler($notification);

        return [
            'name' => $name,
            'brand_name' => $brandName,
            'preheader' => $handler->preheader(),
            'button_url' => route('admin.products.create'),
        ];
    }

    private function send(ManagerNotification $notification, Brand $brand, string $trigger, array $attributes): ?ManagerNotificationDelivery
    {
        $handler = $this->registry->handler($notification);
        /** @var User $user */
        $user = $brand->user;

        try {
            return DB::transaction(function () use ($notification, $brand, $user, $handler, $trigger, $attributes) {
                $email = $this->queue->enqueue(
                    templateKey: $handler->template(),
                    toEmail: $user->email,
                    subject: $handler->subject(),
                    payload: $this->payload($notification, $user->first_name, $brand->name),
                    options: ['to_name' => $user->first_name, 'source_model' => $brand],
                );

                return ManagerNotificationDelivery::create([
                    'manager_notification_id' => $notification->id,
                    'brand_id' => $brand->id,
                    'user_id' => $user->id,
                    'email_message_id' => $email->id,
                    'trigger' => $trigger,
                    ...$attributes,
                ]);
            });
        } catch (UniqueConstraintViolationException $e) {
            // Чужое нарушение уникальности — настоящая ошибка, не «уже отправлено».
            if (! str_contains($e->getMessage(), self::UNIQUE_SEND_INDEX)) {
                throw $e;
            }

            // Параллельный или повторный запуск уже отправил письмо по этому
            // событию. Транзакция откатила и письмо, так что дубля в очереди нет.
            return null;
        }
    }
}
