<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Персональная конфигурация способа доставки: запись = бренд × конструктор.
 * merchant_settings / customer_settings — снапшот полей конструктора со значениями:
 * [{key, name, type, value}, ...].
 *
 * @property int $id
 * @property int $shipping_method_constructor_id
 * @property array $merchant_settings
 * @property array $customer_settings
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read ShippingMethodConstructor $methodConstructor
 * @property-read Collection<Brand> $brands
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipping_method_constructor_id',
        'merchant_settings',
        'customer_settings',
    ];

    protected $casts = [
        'merchant_settings' => 'array',
        'customer_settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function methodConstructor(): BelongsTo
    {
        return $this->belongsTo(ShippingMethodConstructor::class, 'shipping_method_constructor_id');
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class);
    }
}
