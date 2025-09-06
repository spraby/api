<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property string $id
 * @property string $name
 * @property string $src
 * @property string|null $alt
 * @property string|null $meta
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property string $url
 * @property-read Collection<ProductImage> $productImages
 * @property-read Collection<Brand> $brands
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'src',
        'alt',
        'meta',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * @return string
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('s3')->url($this->src);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_images')
            ->withPivot(['id', 'position'])
            ->withTimestamps()
            ->as('pivot');
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class);
    }

    /**
     * @return void
     */
    protected static function booted(): void
    {
        static::created(function (Image $image) {
            /**
             * @var User $user
             * @var Brand $brand
             * @var Image $image
             */
            $user = auth()->user();
            if (!$user) return;
            $brand = $user->brands->first();
            if ($brand) $image->brands()->syncWithoutDetaching($brand->id);
        });

        /**
         *
         */
        static::deleting(function (Image $image) {
            if ($image->src) {
                Storage::disk('s3')->delete($image->src);
            }
        });
    }
}
