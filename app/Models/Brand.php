<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @property string $id
 * @property string|null $user_id
 * @property string $name
 * @property string|null $description
 // * @property string|null $instagram
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read User|null $user
 * @property-read Collection<Product> $products
 * @property-read Collection<Category> $categories
 * @property-read Collection<BrandSettings> $settings
 * @property-read Collection<Order> $orders
 * @property-read Collection<Image> $images
 * @property-read Collection<Address> $addresses
 * @property-read Collection<Contact> $contacts
 * @property-read Collection<ShippingMethod> $shippingMethods
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
        // 'instagram',
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

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function contacts(): MorphMany
    {
        return $this->morphMany(Contact::class, 'contactable');
    }

    public function shippingMethods(): BelongsToMany
    {
        return $this->belongsToMany(ShippingMethod::class);
    }

    public static function toMoney(float $value): string
    {
        $format = '{amount} BYN'; // @todo get form settings

        return str_replace('{amount}', number_format($value, 2, '.', ' '), $format);
    }
}
