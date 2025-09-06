<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, BelongsToMany};
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string|null $user_id
 * @property string $name
 * @property string|null $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read User|null $user
 * @property-read Collection<Product> $products
 * @property-read Collection<Category> $categories
 * @property-read Collection<BrandSettings> $settings
 * @property-read Collection<Order> $orders
 * @property-read Collection<Image> $images
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function settings(): HasMany
    {
        return $this->hasMany(BrandSettings::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function images(): BelongsToMany
    {
        return $this->belongsToMany(Image::class);
    }

    /**
     * @param float $value
     * @return string
     */
    public static function toMoney(float $value): string {
        $format = "{amount} BYN"; //@todo get form settings
        return str_replace("{amount}", number_format($value, 2, '.', ' '), $format);
    }
}
