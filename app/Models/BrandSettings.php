<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $type
 * @property array $data
 * @property string $brand_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Brand $brand
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class BrandSettings extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'type' => 'string',
    ];

    public const TYPES = [
        'REFUND' => 'refund',
        'ADDRESSES' => 'addresses',
        'DELIVERY' => 'delivery',
        'PHONES' => 'phones',
        'EMAILS' => 'emails',
        'SOCIALS' => 'socials',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}
