# Руководство разработчика

[← Назад к оглавлению](README.md)

## Типичные задачи

### Добавление поля в Product

```bash
# 1. Создать миграцию
php artisan make:migration add_field_to_products_table

# 2. Редактировать миграцию
# database/migrations/xxxx_add_field_to_products_table.php
public function up() {
    Schema::table('products', function (Blueprint $table) {
        $table->string('new_field')->nullable();
    });
}

# 3. Запустить миграцию
php artisan migrate

# 4. Добавить в $fillable модели
// app/Models/Product.php
protected $fillable = ['new_field', ...];

# 5. Обновить Filament форму
// app/Filament/Resources/Products/Schemas/ProductForm.php

# 6. Обновить Prisma schemas
// admin/prisma/schema.prisma
// store/prisma/schema.prisma

# 7. Регенерировать Prisma
cd admin && npm run db:generate
cd store && npm run db:generate
```

### Создание Filament Resource

```bash
php artisan make:filament-resource ModelName --generate

# Создаст:
# - app/Filament/Resources/ModelNameResource.php
# - app/Filament/Resources/ModelName/Pages/...
```

### Работа с изображениями

```php
use Illuminate\Support\Facades\Storage;

// Upload
$path = Storage::disk('s3')->put('products', $file);

// Delete
Storage::disk('s3')->delete($path);

// Get URL
$url = Storage::disk('s3')->url($path);
```

### Добавление роли/permission

```php
// В seeder
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

$role = Role::create(['name' => 'new_role']);
$permission = Permission::create(['name' => 'new_permission']);

$role->givePermissionTo($permission);
```

## Testing

```bash
# Все тесты
vendor/bin/phpunit

# Unit тесты
vendor/bin/phpunit tests/Unit

# Feature тесты
vendor/bin/phpunit tests/Feature

# Конкретный тест
vendor/bin/phpunit --filter TestName
```

## Troubleshooting

### Права доступа

```bash
make fix-perms
# или
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### S3 не работает

1. Проверьте ENV: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`
2. Проверьте IAM permissions
3. Проверьте `FILESYSTEM_DISK=s3`

### Filament не отображается

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
npm run build
```

### База данных

```bash
# Войти в PostgreSQL
make psql

# Проверить миграции
php artisan migrate:status

# Fresh DB
php artisan migrate:fresh --seed
```

## Code Style

```bash
# Laravel Pint
./vendor/bin/pint

# Проверка
./vendor/bin/pint --test
```

## Production

```bash
# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install dependencies
composer install --optimize-autoloader --no-dev

# Build assets
npm run build
```

## Best Practices

1. **Всегда используйте transactions** для критических операций
2. **Eager loading** для избежания N+1
3. **Валидация** на уровне Form Requests
4. **Row Level Security** в Filament Resources
5. **Observer Pattern** для lifecycle hooks

[← Назад к оглавлению](README.md)
