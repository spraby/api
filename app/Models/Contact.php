<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string $type
 * @property string $value
 * @property string $contactable_type
 * @property int $contactable_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Model $contactable
 *
 * @method static \Illuminate\Database\Eloquent\Builder|static query()
 *
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Contact extends Model
{
    use HasFactory;

    public const TYPE_EMAIL = 'email';
    public const TYPE_PHONE = 'phone';
    public const TYPE_WHATSAPP = 'whatsapp';
    public const TYPE_TELEGRAM = 'telegram';
    public const TYPE_INSTAGRAM = 'instagram';
    public const TYPE_FACEBOOK = 'facebook';

    public const TYPES = [
        self::TYPE_EMAIL,
        self::TYPE_PHONE,
        self::TYPE_WHATSAPP,
        self::TYPE_TELEGRAM,
        self::TYPE_INSTAGRAM,
        self::TYPE_FACEBOOK,
    ];

    protected $fillable = [
        'type',
        'value',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function contactable(): MorphTo
    {
        return $this->morphTo();
    }
}
