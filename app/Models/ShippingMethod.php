<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $key
 * @property string $name
 * @property string|null $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Collection<Brand> $brands
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class ShippingMethod extends Model
{
    use HasFactory;

    public const KEY_EURO_POST_RB = 'euro_post_rb';
    public const KEY_COURIER_MINSK = 'courier_minsk';
    public const KEY_PICKUP = 'pickup';

    public const DEFAULTS = [
        self::KEY_EURO_POST_RB => 'ЕВРОПОЧТА по РБ',
        self::KEY_COURIER_MINSK => 'Курьером по Минску',
        self::KEY_PICKUP => 'Самовывоз',
    ];

    protected $fillable = [
        'key',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Convert to array for frontend select/checkbox components.
     */
    public function toSelectArray(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
        ];
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class);
    }
}
