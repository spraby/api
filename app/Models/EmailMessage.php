<?php

namespace App\Models;

use App\Enums\EmailStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string $to_email
 * @property string|null $to_name
 * @property string|null $from_email
 * @property string|null $from_name
 * @property string|null $reply_to
 * @property string $template_key
 * @property string $subject
 * @property array $payload
 * @property string $locale
 * @property EmailStatus $status
 * @property int $attempts
 * @property int $max_attempts
 * @property string|null $last_error
 * @property Carbon $scheduled_at
 * @property Carbon|null $sent_at
 * @property string|null $source_type
 * @property int|null $source_id
 * @property string|null $resend_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @method static Builder|static query()
 * @method static Builder|static dueNow()
 *
 * @mixin Builder
 */
class EmailMessage extends Model
{
    protected $guarded = [];

    protected $casts = [
        'payload' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'attempts' => 'integer',
        'max_attempts' => 'integer',
        'status' => EmailStatus::class,
    ];

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeDueNow(Builder $query): void
    {
        $query->where('status', EmailStatus::Pending->value)
            ->where('scheduled_at', '<=', now());
    }
}
