<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string $type
 * @property array $data
 * @property string $brand_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read Brand $brand
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class BrandSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'type',
        'data',
        'brand_id',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'type' => 'string',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}
