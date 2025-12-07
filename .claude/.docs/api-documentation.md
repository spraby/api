# Spraby API - Документация для AI-агентов

Эта документация создана специально для AI-агентов, работающих с Laravel API проектом Spraby.

## Обзор проекта

**Spraby API** - это backend приложение интернет-магазина, построенное на Laravel 12 с административной панелью Filament 4.0.

### Технологический стек

- **Framework**: Laravel 12
- **Admin Panel**: Filament 4.0
- **Database**: PostgreSQL 15
- **ORM**: Eloquent
- **File Storage**: AWS S3 (через league/flysystem-aws-s3-v3)
- **Authorization**: Spatie Laravel Permission
- **Containerization**: Docker (PHP-FPM + Nginx + PostgreSQL)
- **Asset Building**: Vite
- **Testing**: PHPUnit

### Порты и контейнеры

- **Nginx**: порт 8000 (spraby-api-nginx)
- **PHP-FPM**: spraby-api
- **PostgreSQL**: порт 5435 (spraby-api-postgres)

## Архитектура приложения

### Структура директорий

```
api/
├── app/
│   ├── Console/          # Artisan команды
│   ├── Filament/         # Filament admin ресурсы
│   │   ├── Actions/      # Кастомные действия
│   │   ├── Components/   # Кастомные компоненты
│   │   ├── Resources/    # CRUD ресурсы (Brands, Categories, Products, Users и т.д.)
│   │   └── Tables/       # Конфигурации таблиц
│   ├── Http/             # HTTP layer
│   │   ├── Controllers/  # Контроллеры
│   │   └── Middleware/   # Middleware
│   ├── Livewire/         # Livewire компоненты (ImagePicker)
│   ├── Models/           # Eloquent модели
│   │   └── Traits/       # Model traits
│   ├── Observers/        # Model observers (ProductImageObserver)
│   ├── Policies/         # Authorization policies
│   ├── Providers/        # Service providers
│   └── View/             # View components
├── config/               # Конфигурационные файлы
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # 32 миграции
│   └── seeders/          # 19 seeders
├── routes/
│   └── web.php           # Web маршруты (минимальные)
├── storage/
│   ├── app/private/      # Локальное хранилище (приватное)
│   └── app/public/       # Локальное хранилище (публичное)
├── tests/
│   ├── Feature/          # Feature tests
│   └── Unit/             # Unit tests
├── .docker/              # Docker конфигурация
├── docker-compose.yml    # Docker Compose файл
└── Makefile              # Make команды для Docker
```

## Доменная модель (Domain Models)

### Основные сущности и их связи

#### 1. User (Пользователь)
**Файл**: `app/Models/User.php`

**Поля**:
- `id` (UUID)
- `first_name`, `last_name` (nullable)
- `email` (уникальный)
- `password`
- `created_at`, `updated_at`

**Роли** (через Spatie Permission):
- `admin` - полный доступ ко всем ресурсам
- `manager` - ограниченный доступ (см. константы ADMIN_PERMISSIONS и MANAGER_PERMISSIONS)

**Связи**:
- `hasMany` -> Brand (пользователь может иметь несколько брендов)

**Права доступа**:
```php
// Разрешения менеджера
READ/WRITE_PRODUCTS, READ/WRITE_PRODUCT_VARIANTS,
READ_CATEGORIES, READ_COLLECTIONS, READ_OPTIONS,
READ_OPTION_VALUES, READ/WRITE_IMAGES

// Дополнительные разрешения администратора
WRITE_CATEGORIES, READ/WRITE_COLLECTIONS,
READ/WRITE_BRANDS, READ/WRITE_USERS,
WRITE_OPTIONS, WRITE_OPTION_VALUES
```

**Scopes**:
- `email($email)` - поиск по email
- `admin()` - только администраторы
- `manager()` - только менеджеры

**Методы**:
- `isAdmin()` - проверка роли администратора
- `isManager()` - проверка роли менеджера
- `getBrand()` - получить первый бренд пользователя

---

#### 2. Brand (Бренд)
**Файл**: `app/Models/Brand.php`

**Поля**:
- `id` (UUID)
- `user_id` (nullable) - владелец бренда
- `name` - название бренда
- `description` (nullable)
- `created_at`, `updated_at`

**Связи**:
- `belongsTo` -> User
- `hasMany` -> Product
- `belongsToMany` -> Category (many-to-many через pivot)
- `hasMany` -> BrandSettings
- `hasMany` -> Order
- `belongsToMany` -> Image (many-to-many)

**Методы**:
- `toMoney($value)` - статический метод форматирования денег (BYN)

---

#### 3. Product (Товар)
**Файл**: `app/Models/Product.php`

**Поля**:
- `id` (UUID)
- `brand_id` - бренд товара
- `category_id` (nullable) - категория
- `title` - название
- `description` (nullable)
- `enabled` (boolean) - активен ли товар
- `price` (decimal:2) - базовая цена
- `final_price` (decimal:2) - итоговая цена (с учетом скидки)
- `created_at`, `updated_at`

**Виртуальные атрибуты**:
- `externalUrl` - URL товара на фронтенде (store app)
- `discount` - процент скидки (вычисляется из price и final_price)
- `mainImage` - главное изображение (первое по позиции)

**Связи**:
- `belongsTo` -> Brand
- `belongsTo` -> Category
- `hasMany` -> Variant (варианты товара)
- `hasMany` -> ProductImage
- `hasManyThrough` -> Image (через ProductImage)
- `hasManyThrough` -> Option (через Category)
- `hasMany` -> OrderItem
- `hasMany` -> ProductStatistics (views)

**Lifecycle hooks**:
- `creating`: автоматически устанавливает `brand_id` из текущего пользователя

**Методы**:
- `reorderImages()` - перенумеровать изображения по позициям

---

#### 4. Category (Категория)
**Файл**: `app/Models/Category.php`

**Связи**:
- `belongsToMany` -> Brand
- `hasMany` -> Product
- `hasMany` -> Option (опции, специфичные для категории)

---

#### 5. Collection (Коллекция)
**Файл**: `app/Models/Collection.php`

**Связи**:
- `belongsToMany` -> Product (many-to-many)

**Особенности**:
- Имеет SEO поля (добавлены в миграции)
- Имеет поле `header` (заголовок)

---

#### 6. Option (Опция товара)
**Файл**: `app/Models/Option.php`

Примеры: "Цвет", "Размер", "Материал"

**Связи**:
- `hasMany` -> OptionValue (значения опции)
- Опции привязаны к категориям

---

#### 7. OptionValue (Значение опции)
**Файл**: `app/Models/OptionValue.php`

Примеры: "Красный", "XL", "Хлопок"

**Поля**:
- `position` - порядок сортировки

**Связи**:
- `belongsTo` -> Option

---

#### 8. Variant (Вариант товара)
**Файл**: `app/Models/Variant.php`

Представляет конкретную комбинацию опций товара (например: "Красная футболка, размер XL")

**Поля**:
- `id` (UUID)
- `product_id`
- `image_id` (nullable) - специфичное изображение варианта
- `title` (nullable) - название варианта
- `price` (decimal:2)
- `final_price` (decimal:2)
- `enabled` (boolean)
- `created_at`, `updated_at`

**Виртуальные атрибуты**:
- `discount` - процент скидки

**Связи**:
- `belongsTo` -> Product
- `belongsTo` -> ProductImage (image)
- `hasMany` -> VariantValue (значения опций этого варианта)
- `hasMany` -> OrderItem

---

#### 9. VariantValue (Значения опций варианта)
**Файл**: `app/Models/VariantValue.php`

Связывает Variant с конкретными OptionValue

**Связи**:
- `belongsTo` -> Variant
- `belongsTo` -> OptionValue

---

#### 10. Image (Изображение)
**Файл**: `app/Models/Image.php`

**Поля**:
- `id` (UUID)
- `name` - имя файла
- `src` - путь в S3
- `alt` (nullable) - альтернативный текст
- `meta` (nullable) - мета-информация
- `created_at`, `updated_at`

**Виртуальные атрибуты**:
- `url` - полный URL из S3

**Связи**:
- `belongsToMany` -> Product (через pivot ProductImage)
- `belongsToMany` -> Brand

**Lifecycle hooks**:
- `created`: автоматически связывает изображение с брендом текущего пользователя
- `deleting`: удаляет файл из S3

**Особенности**:
- Все изображения хранятся в AWS S3
- Используется Storage::disk('s3')

---

#### 11. ProductImage (Связь товара и изображения)
**Файл**: `app/Models/ProductImage.php`

**Поля**:
- `id` (UUID)
- `product_id`
- `image_id`
- `position` - порядок отображения изображений
- `created_at`, `updated_at`

**Связи**:
- `belongsTo` -> Product
- `belongsTo` -> Image

**Observer**: `ProductImageObserver` - отслеживает изменения

---

#### 12. Order (Заказ)
**Файл**: `app/Models/Order.php`

**Поля**:
- `id` (UUID)
- `name` - номер заказа (например: "#12345")
- `customer_id`
- `brand_id`
- `note` (nullable) - примечание
- `status` - статус заказа
- `delivery_status` - статус доставки
- `financial_status` - финансовый статус
- `created_at`, `updated_at`

**Статусы заказа**:
```php
PENDING, CONFIRMED, PROCESSING, COMPLETED, CANCELLED, ARCHIVED
```

**Статусы доставки**:
```php
PENDING, PACKING, SHIPPED, TRANSIT, DELIVERED
```

**Финансовые статусы**:
```php
UNPAID, PAID, PARTIAL_PAID, REFUNDED
```

**Виртуальные атрибуты**:
- `status_url` - URL для отслеживания заказа на фронтенде

**Связи**:
- `belongsTo` -> Customer
- `belongsTo` -> Brand
- `hasMany` -> OrderShipping
- `hasMany` -> OrderItem

**Traits**:
- `Auditable` - аудит изменений (из `app/Models/Traits/Auditable.php`)

---

#### 13. OrderItem (Позиция заказа)
**Файл**: `app/Models/OrderItem.php`

**Связи**:
- `belongsTo` -> Order
- `belongsTo` -> Product
- `belongsTo` -> Variant

---

#### 14. OrderShipping (Доставка заказа)
**Файл**: `app/Models/OrderShipping.php`

**Связи**:
- `belongsTo` -> Order

---

#### 15. Customer (Покупатель)
**Файл**: `app/Models/Customer.php`

**Связи**:
- `hasMany` -> Order

---

#### 16. Settings (Настройки)
**Файл**: `app/Models/Settings.php`

Глобальные настройки приложения

---

#### 17. BrandSettings (Настройки бренда)
**Файл**: `app/Models/BrandSettings.php`

**Связи**:
- `belongsTo` -> Brand

---

#### 18. ProductStatistics (Статистика товара)
**Файл**: `app/Models/ProductStatistics.php`

**Поля**:
- `type` - тип статистики (например: 'view')

**Связи**:
- `belongsTo` -> Product

---

## Filament Admin Panel

### Основные ресурсы

Все Filament ресурсы находятся в `app/Filament/Resources/`:

1. **Brands** - управление брендами
2. **Categories** - управление категориями
3. **Collections** - управление коллекциями
4. **Images** - управление изображениями
5. **Options** - управление опциями товаров
6. **OptionValues** - управление значениями опций
7. **Orders** - управление заказами
8. **Products** - управление товарами (основной ресурс)
9. **ProductImages** - управление изображениями товаров
10. **Users** - управление пользователями
11. **Variants** - управление вариантами товаров

### Особенности ProductResource

**Файл**: `app/Filament/Resources/Products/ProductResource.php`

- Использует кастомные формы: `ProductForm::configure()`
- Использует кастомные таблицы: `ProductsTable::configure()`
- Имеет Relation Managers:
  - `VariantsRelationManager` - управление вариантами
  - `ImagesRelationManager` - управление изображениями
- **Row Level Security**: менеджеры видят только товары своего бренда, администраторы - все товары

```php
public static function getEloquentQuery(): Builder
{
    $user = Auth::user();
    if ($user?->hasRole(User::ROLES['ADMIN'])) return $query;

    $brand = $user->getBrand();
    return $query->when($brand, function (Builder $r) use ($brand) {
        $r->whereHas('brand', fn($q) => $q->where('brand_id', $brand->id));
    });
}
```

### Livewire компоненты

**ImagePicker** (`app/Livewire/ImagePicker.php`) - кастомный компонент для выбора изображений из S3.

## База данных

### Миграции

Всего 32 миграции, основные таблицы:

1. `users` - пользователи
2. `brands` - бренды
3. `categories` - категории
4. `collections` - коллекции
5. `options` - опции товаров
6. `option_values` - значения опций
7. `products` - товары
8. `variants` - варианты товаров
9. `variant_values` - значения опций вариантов
10. `images` - изображения
11. `product_images` - связь товаров и изображений (с полем position)
12. `customers` - покупатели
13. `orders` - заказы
14. `order_items` - позиции заказов
15. `order_shippings` - доставка заказов
16. `settings` - глобальные настройки
17. `brand_settings` - настройки брендов
18. `product_statistics` - статистика товаров
19. `audits` - аудит изменений
20. Pivot таблицы (brand_category, brand_image, collection_product и т.д.)
21. Таблицы Spatie Permission (permissions, roles, model_has_roles и т.д.)

### Seeders

**DatabaseSeeder** запускает 19 seeders в строгом порядке:

```php
UserSeeder -> BrandSeeder -> CategorySeeder -> OptionSeeder ->
OptionValueSeeder -> ProductSeeder -> VariantSeeder ->
VariantValueSeeder -> CustomerSeeder -> OrderSeeder ->
OrderItemSeeder -> OrderShippingSeeder -> ImageSeeder ->
ProductImageSeeder -> BrandImageSeeder -> SettingsSeeder ->
BrandSettingsSeeder
```

## Хранилище файлов

### AWS S3 конфигурация

**Файл**: `config/filesystems.php`

- Диск по умолчанию: `local` или `s3` (через env FILESYSTEM_DISK)
- S3 используется для всех изображений продуктов
- Изображения автоматически удаляются из S3 при удалении записи Image

### Локальное хранилище

- `storage/app/private` - приватные файлы
- `storage/app/public` - публичные файлы (не используется, т.к. S3)

## Маршруты

**Файл**: `routes/web.php`

Минимальное количество маршрутов, т.к. основная функциональность в Filament:

1. `/` - welcome страница
2. `/set-locale/{locale}` - смена языка (en/ru)

Все админские маршруты генерируются Filament автоматически.

## Локализация

Поддерживаемые языки:
- `en` - английский
- `ru` - русский

Смена языка через сессию: `/set-locale/{locale}`

## Background Jobs & Queues

- Настроен queue system для фоновых задач
- Конфигурация в `config/queue.php`
- Запуск: `php artisan queue:listen --tries=1`

## Важные паттерны и практики

### 1. UUID вместо auto-increment ID
Все модели используют UUID как primary key.

### 2. Автоматическая привязка к бренду
При создании Product и Image автоматически устанавливается `brand_id` текущего пользователя через lifecycle hooks.

### 3. Soft Deletes
**НЕ используются** в этом проекте - все удаления жесткие (hard delete).

### 4. Observers
- `ProductImageObserver` - отслеживает изменения в product_images

### 5. Scopes
Используются для фильтрации:
- `User::admin()` - только администраторы
- `User::manager()` - только менеджеры
- `User::email($email)` - поиск по email

### 6. Виртуальные атрибуты (Accessors)
- `Product::$externalUrl` - URL на frontend
- `Product::$discount` - процент скидки
- `Product::$mainImage` - главное изображение
- `Image::$url` - полный S3 URL
- `Order::$status_url` - URL отслеживания

### 7. Транзакции
Используются для критических операций (например `reorderImages()`)

## Конфигурация окружения

### Ключевые ENV переменные

```bash
# Application
APP_NAME=Spraby
APP_ENV=local/production
APP_DEBUG=true/false
APP_URL=http://localhost:8000
STORE_URL=http://localhost:3010  # URL фронтенд приложения

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=password

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_URL=

# Filesystem
FILESYSTEM_DISK=s3

# Mail
MAIL_MAILER=smtp
```

## Команды разработки

### Docker (рекомендуется)

```bash
make up          # Запустить контейнеры
make build       # Собрать и запустить
make down        # Остановить контейнеры
make restart     # Пересобрать и перезапустить
make bash        # Войти в контейнер PHP
make migrate     # Запустить миграции
make seed        # Заполнить БД тестовыми данными
make logs        # Просмотр логов
make psql        # Войти в PostgreSQL
make composer    # Установить зависимости
make fix-perms   # Исправить права доступа storage/
```

### Локальная разработка

```bash
composer dev             # Запустить сервер, queue, logs, vite одновременно
php artisan serve        # Только сервер (порт 8000)
php artisan migrate      # Миграции
php artisan migrate:fresh --seed  # Пересоздать БД с данными
php artisan db:seed      # Только seeding
php artisan pail         # Просмотр логов
npm run dev              # Vite dev server
npm run build            # Build для production
```

### Тестирование

```bash
vendor/bin/phpunit                    # Все тесты
vendor/bin/phpunit tests/Unit         # Unit тесты
vendor/bin/phpunit tests/Feature      # Feature тесты
vendor/bin/phpunit --filter TestName  # Конкретный тест
```

### Artisan команды

```bash
php artisan tinker              # REPL для отладки
php artisan route:list          # Список маршрутов
php artisan migrate:status      # Статус миграций
php artisan queue:work          # Обработка queue
php artisan storage:link        # Создать symlink для storage
```

## Типичные задачи

### Добавление нового поля в Product

1. Создать миграцию: `php artisan make:migration add_field_to_products_table`
2. Добавить поле в `$fillable` в `app/Models/Product.php`
3. Добавить в `$casts` если нужен casting
4. Обновить Filament form в `app/Filament/Resources/Products/Schemas/ProductForm.php`
5. Обновить Prisma схемы в `admin/prisma/schema.prisma` и `store/prisma/schema.prisma`
6. Запустить: `make migrate` и `npm run db:generate` в admin/ и store/

### Создание нового Filament Resource

```bash
php artisan make:filament-resource ModelName --generate
```

Это создаст:
- Resource класс
- Form schema
- Table schema
- Pages (List, Create, Edit)

### Работа с изображениями

Все изображения загружаются через Filament в S3:

1. Пользователь загружает файл через ImagePicker
2. Создается запись в таблице `images`
3. Файл сохраняется в S3
4. Создается связь в `product_images` с полем `position`
5. При удалении Image файл автоматически удаляется из S3

### Изменение прав доступа

1. Добавить новое разрешение в `User::PERMISSIONS`
2. Добавить в `User::ADMIN_PERMISSIONS` или `User::MANAGER_PERMISSIONS`
3. Обновить Seeder для ролей
4. Применить в Filament Resource через `can()` или policies

## Интеграция с Frontend

### API эндпоинты
⚠️ **ВАЖНО**: Этот проект НЕ имеет REST API.

Frontend приложения (admin и store) подключаются **напрямую к той же БД PostgreSQL** через Prisma ORM и используют server actions.

### Связь между системами

1. **База данных**: общая PostgreSQL
2. **Изображения**: общий S3 bucket
3. **URL генерация**:
   - `Product::$externalUrl` - создает ссылку на `{STORE_URL}/products/{id}`
   - `Order::$status_url` - создает ссылку на `{STORE_URL}/purchases/{name}`

### Синхронизация схемы

При изменении схемы БД нужно обновить:
1. Laravel миграции (`api/database/migrations/`)
2. Prisma схемы (`admin/prisma/schema.prisma` и `store/prisma/schema.prisma`)

## Troubleshooting

### Ошибки прав доступа (Permission denied)

```bash
make fix-perms  # В Docker
# или
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Проблемы с S3

1. Проверить ENV переменные: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`
2. Проверить `config/filesystems.php`
3. Проверить права IAM пользователя в AWS

### База данных не подключается

1. Проверить что контейнер PostgreSQL запущен: `docker ps`
2. Проверить переменные `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
3. Попробовать подключиться напрямую: `make psql`

### Filament не отображается

1. Очистить кеш: `php artisan cache:clear`
2. Очистить конфиг: `php artisan config:clear`
3. Пересобрать assets: `npm run build`
4. Проверить что пользователь имеет роль admin или manager

## Безопасность

### Важные моменты

1. **Password hashing**: используется bcrypt через встроенный Laravel hasher
2. **CSRF Protection**: включена для всех POST/PUT/DELETE запросов
3. **Row Level Security**: менеджеры видят только данные своего бренда
4. **Permission-based access**: через Spatie Permission
5. **SQL Injection**: защита через Eloquent ORM и prepared statements
6. **File Upload**: валидация типов файлов в ImagePicker

### Рекомендации

- Никогда не коммитить `.env` файлы
- Использовать строгие права доступа в IAM для S3
- Регулярно обновлять зависимости: `composer update`
- Использовать HTTPS в production

## Performance

### Оптимизации

1. **Eager Loading**: использовать `with()` для избежания N+1 проблемы
   ```php
   Product::with(['brand', 'category', 'images'])->get();
   ```

2. **Caching**: настроен в `config/cache.php`

3. **Queue**: длительные операции в фоне

4. **Database Indexes**: созданы в миграциях для часто используемых полей

## Дополнительные ресурсы

### Документация технологий

- Laravel 12: https://laravel.com/docs/12.x
- Filament 4: https://filamentphp.com/docs/4.x
- Spatie Permission: https://spatie.be/docs/laravel-permission
- AWS S3: https://docs.aws.amazon.com/s3/

### Код-стайл

Проект использует Laravel Pint для форматирования:
```bash
./vendor/bin/pint
```

Конфигурация: PSR-12 стандарт.

---

**Дата последнего обновления**: 2025-11-23
**Версия документации**: 1.0