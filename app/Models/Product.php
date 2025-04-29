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

    public function images(): BelongsToMany
    {
        return $this->belongsToMany(Image::class, 'product_images')
            ->withPivot(['id', 'position'])
            ->using(ProductImage::class)
            ->as('images')
            ->orderBy('product_images.position');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
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
}
