<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;

/**
 * @property string $id
 * @property string $brand_id
 * @property string|null $category_id
 * @property string $title
 * @property string|null $description
 * @property bool $enabled
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property string $externalUrl
 * @property float $discount
 * @property ProductImage|null $mainImage
 * @property string|null $imageUrl
 * @property float|null $minPrice
 * @property float|null $maxPrice
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
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function options(): HasManyThrough
    {
        return $this->hasManyThrough(
            Option::class,
            Category::class,
            'id',
            'id',
            'category_id',
            'id'
        );
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

    public function media(): HasManyThrough
    {
        return $this->hasManyThrough(
            Image::class,
            ProductImage::class,
            'product_id',
            'id',
            'id',
            'image_id'
        );
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ProductStatistics::class)->where('type', 'view');
    }

    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            if (! $user) {
                return;
            }
            $brand = $user->brands()->first();
            if ($brand) {
                $model->brand_id = $brand->id;
            }
        });
    }

    public function getMainImageAttribute(): ?ProductImage
    {
        return $this->images?->sortBy('position')?->first();
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->mainImage?->image?->url;
    }

    public function getMinPriceAttribute(): ?float
    {
        $prices = $this->variants?->pluck('final_price')->filter();

        return $prices?->isNotEmpty() ? (float) $prices->min() : null;
    }

    public function getMaxPriceAttribute(): ?float
    {
        $prices = $this->variants?->pluck('final_price')->filter();

        return $prices?->isNotEmpty() ? (float) $prices->max() : null;
    }

    public function getExternalUrlAttribute(): string
    {
        return config('app.store_url').'/products/'.$this->id;
    }

    public function reorderImages(): void
    {
        DB::transaction(function () {
            $images = $this->images()->orderBy('position')->get();
            foreach ($images as $index => $image) {
                $image->updateQuietly(['position' => $index + 1]);
            }
        });
    }
}
