# Spraby API - Документация для AI-агентов

Эта документация создана специально для AI-агентов, работающих с Laravel 12 API проектом Spraby с административной панелью Filament 4.0.

## Обзор проекта

**Spraby API** - это backend приложение интернет-магазина, построенное на Laravel 12 с административной панелью Filament 4.0 для управления товарами, заказами и контентом.

### Быстрый старт

**Docker (рекомендуется)**:
```bash
cd api
make up              # Запустить контейнеры
make migrate         # Запустить миграции
make seed            # Заполнить БД
```

**Локально**:
```bash
cd api
composer dev         # Запустить server, queue, logs, vite
```

## Структура документации

Документация разбита на логические разделы для удобства навигации:

### 📚 Основные разделы

1. **[Архитектура и технологический стек](./01-architecture.md)**
   - Технологический стек
   - Структура проекта
   - Docker setup
   - Ключевые особенности архитектуры
   - Shared Database с Next.js

2. **[Laravel Models и доменная модель](./02-models.md)**
   - User (роли: admin, manager)
   - Product, Variant, Option
   - Brand, Category, Collection
   - Order, OrderItem, Customer
   - Image, ProductImage
   - Settings
   - Все relationships и accessors

3. **[Filament Admin Panel](./03-filament.md)**
   - Структура Filament Resources
   - ProductResource (основной ресурс)
   - Relation Managers
   - Row Level Security
   - Custom Forms и Tables
   - Livewire компоненты

4. **[Database: Migrations и Seeders](./04-database.md)**
   - 32 миграции
   - Структура всех таблиц
   - Индексы и foreign keys
   - Pivot таблицы
   - 19 Seeders
   - Порядок seeding

5. **[Конфигурация и настройки](./05-configuration.md)**
   - Environment variables
   - Filesystems (S3)
   - Database config
   - Filament config
   - Queue и cache config
   - Spatie Permission config

6. **[Руководство разработчика](./06-development-guide.md)**
   - Типичные задачи
   - Добавление полей в модели
   - Создание Filament Resources
   - Работа с изображениями S3
   - Testing
   - Troubleshooting
   - Code style

## Быстрые ссылки

### Часто используемые файлы

- **Models**: `app/Models/Product.php`, `app/Models/User.php`, `app/Models/Order.php`
- **Filament Resources**: `app/Filament/Resources/Products/ProductResource.php`
- **Migrations**: `database/migrations/`
- **Seeders**: `database/seeders/DatabaseSeeder.php`
- **Config**: `config/filesystems.php`, `config/filament.php`
- **Observers**: `app/Observers/ProductImageObserver.php`

### Docker команды

```bash
make up              # Start containers
make build           # Build and start
make down            # Stop containers
make restart         # Rebuild and restart
make bash            # Access PHP container
make migrate         # Run migrations
make seed            # Seed database
make psql            # Access PostgreSQL
make logs            # View logs
make fix-perms       # Fix storage permissions
make composer        # Install dependencies
```

### Artisan команды

```bash
# Development
php artisan serve           # Dev server (port 8000)
php artisan migrate         # Run migrations
php artisan migrate:fresh --seed  # Fresh DB with data
php artisan db:seed         # Seed only
php artisan pail            # View logs
php artisan queue:work      # Process queue
php artisan tinker          # REPL

# Testing
vendor/bin/phpunit          # Run all tests
vendor/bin/phpunit tests/Unit
vendor/bin/phpunit tests/Feature
vendor/bin/phpunit --filter TestName

# Production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Ключевые концепции

- ✅ **Filament 4.0** - современная админ-панель на Livewire
- ✅ **Shared Database** - та же PostgreSQL БД используется Next.js Store
- ✅ **AWS S3** - все изображения хранятся в S3
- ✅ **Spatie Permission** - role-based access control (admin, manager)
- ✅ **Row Level Security** - менеджеры видят только данные своего бренда
- ✅ **BigInt IDs** - autoincrement BigInt как primary keys
- ✅ **Observer Pattern** - автоматизация через lifecycle hooks
- ✅ **No REST API** - фронтенд подключается напрямую к БД через Prisma

## Важные примечания

⚠️ **КРИТИЧЕСКИ ВАЖНО**:

1. **Синхронизация схем**: При изменении БД обновляйте:
   - Laravel миграции (`database/migrations/`)
   - Prisma schemas в `admin/prisma/schema.prisma` и `store/prisma/schema.prisma`

2. **Row Level Security**: В Filament Resources всегда проверяйте `brand_id` для менеджеров

3. **Image Deletion**: При удалении Image автоматически удаляется файл из S3 (Observer)

4. **Не используется Soft Deletes** - все удаления жесткие (hard delete)

5. **Автоматическая привязка к бренду**: При создании Product/Image автоматически ставится brand_id текущего пользователя

## Навигация по документации

Рекомендуемый порядок чтения для новых разработчиков:

1. Начните с [Архитектуры](./01-architecture.md) для понимания общей структуры
2. Изучите [Laravel Models](./02-models.md) для понимания доменной модели
3. Просмотрите [Filament Admin](./03-filament.md) для понимания админ-панели
4. Изучите [Database Schema](./04-database.md) для понимания структуры БД
5. Познакомьтесь с [Configuration](./05-configuration.md)
6. Используйте [Development Guide](./06-development-guide.md) для практических задач

## Версия

**Дата последнего обновления**: 2025-11-23
**Версия документации**: 2.0
**Laravel**: 12.x
**Filament**: 4.0
**PHP**: 8.2+
**PostgreSQL**: 15