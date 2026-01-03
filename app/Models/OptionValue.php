<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $option_id
 * @property string $value
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Option $option
 * @property-read Collection<VariantValue> $variantValues
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class OptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_id',
        'value',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function option(): BelongsTo
    {
        return $this->belongsTo(Option::class);
    }

    public function variantValues(): HasMany
    {
        return $this->hasMany(VariantValue::class);
    }
}
