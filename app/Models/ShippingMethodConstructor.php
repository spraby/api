<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string|null $key
 * @property string $name
 * @property string|null $description
 * @property bool $active
 * @property int $position
 * @property array $merchant_settings
 * @property array $customer_settings
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Collection<ShippingMethod> $shippingMethods
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class ShippingMethodConstructor extends Model
{
    use HasFactory;

    /**
     * Каталог полей продавца. Подмножество, выбранное админом,
     * снапшотится в merchant_settings конструктора.
     */
    public const MERCHANT_FIELDS = [
        'shipping_price' => ['name' => 'Стоимость доставки', 'type' => 'string'],
        'shipping_countries' => ['name' => 'Страны доставки', 'type' => 'select'],
        'pickup_points' => ['name' => 'Пункты самовывоза', 'type' => 'select'],
        'merchant_notes' => ['name' => 'Комментарий продавца', 'type' => 'string'],
        'free_shipping_threshold' => ['name' => 'Бесплатно от суммы', 'type' => 'number'],
        'shipping_cities' => ['name' => 'Города доставки', 'type' => 'select'],
        'delivery_time' => ['name' => 'Срок доставки', 'type' => 'string'],
    ];

    /**
     * Каталог полей покупателя (заполняются при оформлении заказа).
     */
    public const CUSTOMER_FIELDS = [
        'country' => ['name' => 'Страна', 'type' => 'string'],
        'shipping_address' => ['name' => 'Адрес доставки', 'type' => 'string'],
        'post_office_number' => ['name' => 'Номер отделения', 'type' => 'string'],
        'pickup_point' => ['name' => 'Пункт самовывоза', 'type' => 'string'],
        'city' => ['name' => 'Город', 'type' => 'string'],
        'postal_code' => ['name' => 'Индекс', 'type' => 'string'],
        'post_office_address' => ['name' => 'Адрес отделения', 'type' => 'string'],
        'comments' => ['name' => 'Комментарий к доставке', 'type' => 'string'],
    ];

    protected $fillable = [
        'key',
        'name',
        'description',
        'active',
        'position',
        'merchant_settings',
        'customer_settings',
    ];

    protected $casts = [
        'active' => 'boolean',
        'position' => 'integer',
        'merchant_settings' => 'array',
        'customer_settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function shippingMethods(): HasMany
    {
        return $this->hasMany(ShippingMethod::class);
    }

    /**
     * Собрать json {fields: [...]} из каталога по списку ключей.
     * Порядок полей — порядок каталога; чужие name/type принять нельзя.
     */
    public static function buildFields(array $catalog, array $keys): array
    {
        $fields = [];

        foreach ($catalog as $key => $definition) {
            if (in_array($key, $keys, true)) {
                $fields[] = [
                    'key' => $key,
                    'name' => $definition['name'],
                    'type' => $definition['type'],
                ];
            }
        }

        return ['fields' => $fields];
    }

    /**
     * Поля конструктора + value для записи shipping_methods:
     * [{key, name, type, value}, ...]. Для select пустое значение — [],
     * иначе — пустая строка.
     */
    public static function settingsWithValues(array $fields, array $values): array
    {
        return array_map(function (array $field) use ($values) {
            $empty = ($field['type'] ?? 'string') === 'select' ? [] : '';

            return [
                'key' => $field['key'],
                'name' => $field['name'],
                'type' => $field['type'],
                'value' => $values[$field['key']] ?? $empty,
            ];
        }, array_values($fields));
    }

    /**
     * Каталог в виде списка для фронта: [{key, name, type}, ...].
     */
    public static function catalogList(array $catalog): array
    {
        return array_map(
            fn (string $key, array $definition) => [
                'key' => $key,
                'name' => $definition['name'],
                'type' => $definition['type'],
            ],
            array_keys($catalog),
            $catalog,
        );
    }
}
