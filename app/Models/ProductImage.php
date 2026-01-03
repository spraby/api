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
 * @property string $image_id
 * @property int $position
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Product $product
 * @property-read Image $image
 * @property-read Collection<Variant> $variants
 * @property-read Collection<OrderItem> $orderItems
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_id',
        'position',
    ];

    protected $casts = [
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
