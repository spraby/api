<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $order_id
 * @property string|null $product_id
 * @property string|null $variant_id
 * @property string|null $image_id
 * @property string $title
 * @property string $variant_title
 * @property string|null $description
 * @property int $quantity
 * @property string $price
 * @property string $final_price
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Order $order
 * @property-read Product|null $product
 * @property-read Variant|null $variant
 * @property-read ProductImage|null $image
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'image_id',
        'title',
        'variant_title',
        'description',
        'quantity',
        'price',
        'final_price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(ProductImage::class);
    }
}
