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
    /**
     * Payload keys holding a live one-time credential (a link with a token).
     * The admin email log must never show or forward them: anyone with
     * READ_EMAILS could otherwise take over the recipient's account.
     */
    public const SECRET_PAYLOAD_KEYS = ['reset_url', 'set_password_url'];

    public const REDACTED = '[скрыто]';

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

    /**
     * Payload with secret links replaced by a placeholder — for the admin UI.
     */
    public function redactedPayload(): array
    {
        $payload = $this->payload ?? [];

        foreach (self::SECRET_PAYLOAD_KEYS as $key) {
            if (array_key_exists($key, $payload)) {
                $payload[$key] = self::REDACTED;
            }
        }

        return $payload;
    }

    /**
     * Unsaved copy of this message carrying the redacted payload, for
     * rendering a preview without exposing secret links.
     */
    public function withRedactedPayload(): static
    {
        $copy = clone $this;
        $copy->payload = $this->redactedPayload();

        return $copy;
    }

    public function scopeDueNow(Builder $query): void
    {
        $query->where('status', EmailStatus::Pending->value)
            ->where('scheduled_at', '<=', now());
    }
}
