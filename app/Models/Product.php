<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany, HasMany};
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string $brand_id
 * @property string|null $category_id
 * @property string $title
 * @property string|null $description
 * @property bool $enabled
 * @property string $price
 * @property string $final_price
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property string $externalUrl
 * @property float $discount
 *
 * @property-read Brand $brand
 * @property-read Category|null $category
 * @property-read Collection<Variant> $variants
 * @property-read Collection<ProductImage> $images
 * @property-read Collection<OrderItem> $orderItems
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'category_id',
        'title',
        'description',
        'enabled',
        'price',
        'final_price',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ProductStatistics::class)->where('type', 'view');
    }


    /**
     * @return void
     */
    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            if (!$user) return;
            $brand = $user->brands()->first();
            if ($brand) $model->brand_id = $brand->id;
        });
    }

    /**
     * @return string
     */
    public function getExternalUrlAttribute(): string
    {
        return config('app.store_url') . '/products/' . $this->id;
    }

    /**
     * @return float
     */
    public function getDiscountAttribute(): float
    {
        return round($this->price > 0 ? (($this->price - $this->final_price) / $this->price) * 100 : 0, 0);
    }
}
