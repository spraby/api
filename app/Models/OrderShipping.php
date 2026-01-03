<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $order_id
 * @property string $name
 * @property string $phone
 * @property string $note
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Order $order
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
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
