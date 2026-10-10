<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Вид оповещения менеджеров. Кому и когда слать решает обработчик в коде
 * (выбирается по key), conditions лишь задаёт ему параметры.
 *
 * @property int $id
 * @property string $key
 * @property string $name
 * @property string|null $description
 * @property array $conditions
 * @property int $send_hour Час отправки по Минску, 0–23.
 * @property bool $enabled
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class ManagerNotification extends Model
{
    public const KEY_FIRST_PRODUCT = 'first_product';

    public const KEY_CATALOG_INACTIVITY = 'catalog_inactivity';

    /** Часы отправки и «полные дни» считаем по времени площадки, не по UTC. */
    public const TIMEZONE = 'Europe/Minsk';

    protected $fillable = [
        'send_hour',
        'enabled',
    ];

    protected $casts = [
        'conditions' => 'array',
        'send_hour' => 'integer',
        'enabled' => 'boolean',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(ManagerNotificationDelivery::class);
    }

    public function condition(string $name, mixed $default = null): mixed
    {
        return $this->conditions[$name] ?? $default;
    }
}
