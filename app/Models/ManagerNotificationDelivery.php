<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Одна отправка оповещения: какому бренду, каким письмом, по крону или вручную.
 *
 * @property int $id
 * @property int $manager_notification_id
 * @property int $brand_id
 * @property int|null $user_id Пусто, если пользователя удалили.
 * @property int|null $email_message_id
 * @property string $trigger
 * @property int|null $sent_by_user_id
 * @property Carbon|null $anchor_at Событие, от которого шёл отсчёт (только auto).
 * @property int|null $sequence Номер письма в цикле (только auto).
 * @property Carbon $created_at
 *
 * @method static Builder|static auto()
 */
class ManagerNotificationDelivery extends Model
{
    public const TRIGGER_AUTO = 'auto';

    public const TRIGGER_MANUAL = 'manual';

    public const UPDATED_AT = null;

    protected $fillable = [
        'manager_notification_id',
        'brand_id',
        'user_id',
        'email_message_id',
        'trigger',
        'sent_by_user_id',
        'anchor_at',
        'sequence',
    ];

    protected $casts = [
        'anchor_at' => 'datetime',
        'sequence' => 'integer',
        'created_at' => 'datetime',
    ];

    /** Ручные отправки на автоматическое расписание не влияют. */
    public function scopeAuto(Builder $query): void
    {
        $query->where('trigger', self::TRIGGER_AUTO);
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(ManagerNotification::class, 'manager_notification_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }

    public function emailMessage(): BelongsTo
    {
        return $this->belongsTo(EmailMessage::class);
    }
}
