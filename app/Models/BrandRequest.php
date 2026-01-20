<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $email
 * @property string|null $phone
 * @property string|null $name
 * @property string|null $brand_name
 * @property string $status
 * @property int|null $brand_id
 * @property int|null $user_id
 * @property string|null $rejection_reason
 * @property int|null $reviewed_by
 * @property Carbon|null $approved_at
 * @property Carbon|null $rejected_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Brand|null $brand
 * @property-read User|null $user
 * @property-read User|null $reviewer
 *
 * @method static Builder|static query()
 * @method static Builder|static pending()
 * @method static Builder|static approved()
 * @method static Builder|static rejected()
 *
 * @mixin Builder
 */
class BrandRequest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    protected $fillable = [
        'email',
        'phone',
        'name',
        'brand_name',
        'status',
        'brand_id',
        'user_id',
        'rejection_reason',
        'reviewed_by',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function scopePending(Builder $query): void
    {
        $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved(Builder $query): void
    {
        $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected(Builder $query): void
    {
        $query->where('status', self::STATUS_REJECTED);
    }
}