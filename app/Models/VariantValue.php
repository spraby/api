<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $variant_id
 * @property string $option_id
 * @property string $option_value_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Variant $variant
 * @property-read Option $option
 * @property-read OptionValue $value
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class VariantValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'variant_id',
        'option_id',
        'option_value_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(Option::class);
    }

    public function value(): BelongsTo
    {
        return $this->belongsTo(OptionValue::class, 'option_value_id');
    }
}
