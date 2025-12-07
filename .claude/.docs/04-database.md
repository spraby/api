# Database: Migrations и Seeders

[← Назад к оглавлению](README.md)

## Migrations

**Всего**: 32 миграции в `database/migrations/`

### Основные таблицы

1. `users` - пользователи
2. `brands` - бренды
3. `categories` - категории (handle, name, title, header)
4. `collections` - коллекции (handle, name, title, header)
5. `options` - опции товаров (name, title)
6. `option_values` - значения опций (value, position)
7. `products` - товары (price, final_price, enabled)
8. `variants` - варианты товаров
9. `variant_values` - значения опций вариантов
10. `images` - изображения (src, alt, meta)
11. `product_images` - связь товаров и изображений (position)
12. `customers` - покупатели
13. `orders` - заказы (status, delivery_status, financial_status)
14. `order_items` - позиции заказов
15. `order_shippings` - доставка
16. `settings` - глобальные настройки (key, data JSON)
17. `brand_settings` - настройки брендов (type, data JSON)
18. `product_statistics` - статистика (type: 'view')
19. `audits` - аудит изменений

### Pivot таблицы

- `brand_category`
- `brand_image`
- `category_option`
- `category_collection`
- `collection_product`

### Spatie Permission таблицы

- `permissions`
- `roles`
- `model_has_roles`
- `model_has_permissions`
- `role_has_permissions`

## Seeders

**Всего**: 19 seeders

### Порядок выполнения

**Файл**: `database/seeders/DatabaseSeeder.php`

```php
$this->call([
    UserSeeder::class,          // 1
    BrandSeeder::class,         // 2
    CategorySeeder::class,      // 3
    OptionSeeder::class,        // 4
    OptionValueSeeder::class,   // 5
    ProductSeeder::class,       // 6
    VariantSeeder::class,       // 7
    VariantValueSeeder::class,  // 8
    CustomerSeeder::class,      // 9
    OrderSeeder::class,         // 10
    OrderItemSeeder::class,     // 11
    OrderShippingSeeder::class, // 12
    ImageSeeder::class,         // 13
    ProductImageSeeder::class,  // 14
    BrandImageSeeder::class,    // 15
    SettingsSeeder::class,      // 16
    BrandSettingsSeeder::class, // 17
]);
```

## Команды

```bash
# Fresh migration + seed
php artisan migrate:fresh --seed

# Только миграции
php artisan migrate

# Только seeding
php artisan db:seed

# Конкретный seeder
php artisan db:seed --class=UserSeeder
```

## Следующие шаги

- [Configuration →](05-configuration.md)
- [Development Guide →](06-development-guide.md)

[← Назад к оглавлению](README.md)
