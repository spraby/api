<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{HasMany, BelongsToMany};
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $title
 * @property string|null $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read Collection<OptionValue> $values
 * @property-read Collection<Category> $categories
 * @property-read Collection<VariantValue> $variantValues
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(OptionValue::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function variantValues(): HasMany
    {
        return $this->hasMany(VariantValue::class);
    }
}
