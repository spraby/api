<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $email
 * @property string $name
 * @property string $phone
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Collection<Order> $orders
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'phone',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
