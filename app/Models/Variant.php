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
 * @property string $id
 * @property string $product_id
 * @property string|null $image_id
 * @property string|null $title
 * @property string $price
 * @property string $final_price
 * @property bool $enabled
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property float $discount
 * @property-read Product $product
 * @property-read ProductImage|null $image
 * @property-read Collection<VariantValue> $values
 * @property-read Collection<OrderItem> $orderItems
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Variant extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(ProductImage::class, 'image_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(VariantValue::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getDiscountAttribute(): float
    {
        return round($this->price > 0 ? (($this->price - $this->final_price) / $this->price) * 100 : 0, 0);
    }
}
