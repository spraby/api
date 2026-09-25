<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Универсальная заявка на модерацию: source — любой ресурс (морф-связь),
 * type — что именно проверяем, settings — снимок данных заявки.
 *
 * @property int $id
 * @property string $source_type
 * @property int $source_id
 * @property string $type
 * @property array|null $settings
 * @property string $status
 * @property string|null $reason
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Model|null $source
 * @property-read User|null $reviewer
 *
 * @method static Builder|static query()
 * @method static Builder|static fromBrands()
 *
 * @mixin Builder
 */
class ModerationRequest extends Model
{
    use HasFactory;

    public const TYPE_BRAND_PAGE = 'brand_page';

    /** Смена типа аккаунта бренда (мастер/бизнес), формы занятости и реквизитов. */
    public const TYPE_BRAND_TYPE = 'brand_type';

    public const TYPES = [
        self::TYPE_BRAND_PAGE,
        self::TYPE_BRAND_TYPE,
    ];

    /**
     * Какие типы заявок возможны у каждого источника. Новый тип нужно
     * прописать здесь, иначе он не попадёт в фильтры админки.
     */
    public const TYPES_BY_SOURCE = [
        Brand::class => [
            self::TYPE_BRAND_PAGE,
            self::TYPE_BRAND_TYPE,
        ],
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    protected $fillable = [
        'source_type',
        'source_id',
        'type',
        'settings',
        'status',
        'reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Типы заявок конкретного источника.
     *
     * @return array<int, string>
     */
    public static function typesForSource(string $sourceType): array
    {
        return self::TYPES_BY_SOURCE[$sourceType] ?? [];
    }

    /** Заявки, пришедшие от брендов (source — Brand). */
    public function scopeFromBrands(Builder $query): void
    {
        $query->where('source_type', Brand::class);
    }

    public function scopeOfType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }

    public function scopePending(Builder $query): void
    {
        $query->where('status', self::STATUS_PENDING);
    }
}
