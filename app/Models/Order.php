<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $customer_id
 * @property string $brand_id
 * @property string|null $note
 * @property string $status
 * @property string $delivery_status
 * @property string $financial_status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read Customer $customer
 * @property-read Brand $brand
 * @property-read Collection<OrderShipping> $orderShippings
 * @property-read Collection<OrderItem> $orderItems
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'customer_id',
        'brand_id',
        'note',
        'status',
        'delivery_status',
        'financial_status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'status' => 'string',
        'delivery_status' => 'string',
        'financial_status' => 'string',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function orderShippings(): HasMany
    {
        return $this->hasMany(OrderShipping::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
