<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $src
 * @property string|null $alt
 * @property string|null $meta
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
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

    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class);
    }
}
