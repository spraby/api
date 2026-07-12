<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * shipping_method_name и customer_settings — снапшот на момент заказа,
 * shipping_method_id обнуляется при удалении способа доставки.
 *
 * @property string $id
 * @property string $order_id
 * @property string $name
 * @property string $phone
 * @property string $note
 * @property int|null $shipping_method_id
 * @property string|null $shipping_method_name
 * @property array $customer_settings
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Order $order
 * @property-read ShippingMethod|null $shippingMethod
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class OrderShipping extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'name',
        'phone',
        'note',
        'shipping_method_id',
        'shipping_method_name',
        'customer_settings',
    ];

    protected $casts = [
        'customer_settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}
