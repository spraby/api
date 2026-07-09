<?php

namespace App\Console\Commands\Seeds;

use App\Models\ShippingMethodConstructor;
use Illuminate\Console\Command;

class SeedShippingMethods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:shipping-methods {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed default shipping method constructors';

    private const DEFAULTS = [
        [
            'key' => 'euro_post_rb',
            'name' => 'ЕВРОПОЧТА по РБ',
            'description' => 'Доставка почтовой службой по Беларуси',
            'position' => 10,
            'merchant_fields' => ['shipping_price', 'free_shipping_threshold', 'merchant_notes', 'delivery_time'],
            'customer_fields' => ['city', 'post_office_number', 'post_office_address', 'comments'],
        ],
        [
            'key' => 'courier_minsk',
            'name' => 'Курьером по Минску',
            'description' => 'Адресная доставка курьером магазина',
            'position' => 20,
            'merchant_fields' => ['shipping_price', 'free_shipping_threshold', 'shipping_cities', 'merchant_notes', 'delivery_time'],
            'customer_fields' => ['city', 'shipping_address', 'comments'],
        ],
        [
            'key' => 'pickup',
            'name' => 'Самовывоз',
            'description' => 'Самовывоз из точки продавца',
            'position' => 30,
            'merchant_fields' => ['pickup_points', 'merchant_notes'],
            'customer_fields' => ['pickup_point', 'comments'],
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        if ($this->option('force')) {
            if (app()->isProduction() && !$this->confirm('This will delete all shipping method constructors and brand shipping methods. Continue?')) {
                return;
            }

            // shipping_methods удалятся каскадом по FK на конструктор.
            ShippingMethodConstructor::query()->delete();
        }

        // Матчимся по неизменяемому key и не трогаем существующие записи:
        // повторный прогон в деплое не должен откатывать правки админа
        // (name, поля, позицию, активность).
        foreach (self::DEFAULTS as $default) {
            // Бэкфилл key конструкторам, засеянным до его появления (матч по имени),
            // иначе прогон создал бы для них дубли.
            ShippingMethodConstructor::query()
                ->whereNull('key')
                ->where('name', $default['name'])
                ->update(['key' => $default['key']]);

            ShippingMethodConstructor::firstOrCreate(
                ['key' => $default['key']],
                [
                    'name' => $default['name'],
                    'description' => $default['description'],
                    'active' => true,
                    'position' => $default['position'],
                    'merchant_settings' => ShippingMethodConstructor::buildFields(
                        ShippingMethodConstructor::MERCHANT_FIELDS,
                        $default['merchant_fields'],
                    ),
                    'customer_settings' => ShippingMethodConstructor::buildFields(
                        ShippingMethodConstructor::CUSTOMER_FIELDS,
                        $default['customer_fields'],
                    ),
                ],
            );
        }

        $this->info('Shipping method constructors seeded successfully.');
    }
}
