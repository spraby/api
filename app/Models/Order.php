<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 * @property string $status_url
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
    use Auditable;
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'status' => 'string',
        'delivery_status' => 'string',
        'financial_status' => 'string',
    ];

    public const STATUSES = [
        'PENDING' => 'pending',
        'CONFIRMED' => 'confirmed',
        'PROCESSING' => 'processing',
        'COMPLETED' => 'completed',
        'CANCELLED' => 'cancelled',
        'ARCHIVED' => 'archived',
    ];

    public const DELIVERY_STATUSES = [
        'PENDING' => 'pending',
        'PACKING' => 'packing',
        'SHIPPED' => 'shipped',
        'TRANSIT' => 'transit',
        'DELIVERED' => 'delivered',
    ];

    public const FINANCIAL_STATUSES = [
        'UNPAID' => 'unpaid',
        'PAID' => 'paid',
        'PARTIAL_PAID' => 'partial_paid',
        'REFUNDED' => 'refunded',
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

    public function getStatusUrlAttribute(): string
    {
        return config('app.store_url').'/purchases/'.str_replace('#', '', $this->name);
    }
}
