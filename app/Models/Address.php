<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string|null $name
 * @property string $country
 * @property string|null $province
 * @property string $city
 * @property string|null $zip_code
 * @property string|null $address1
 * @property string|null $address2
 * @property string $addressable_type
 * @property int $addressable_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Model $addressable
 *
 * @method static \Illuminate\Database\Eloquent\Builder|static query()
 *
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'province',
        'city',
        'zip_code',
        'address1',
        'address2',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }
}