# Архитектура и технологический стек

[← Назад к оглавлению](./README.md)

## Технологический стек

### Core
- **Laravel**: 12.x
- **PHP**: 8.2+
- **Filament**: 4.0
- **PostgreSQL**: 15 (port 5435)

### Key Packages
- **Filament**: 4.0 - Admin panel
- **Spatie Laravel Permission**: 6.17 - RBAC
- **AWS S3 Flysystem**: 3.0 - File storage
- **Laravel Pail**: 1.2.2 - Logs
- **PHPUnit**: 11.5.3 - Testing

## Структура проекта

```
api/
├── app/
│   ├── Filament/Resources/    # CRUD ресурсы (11 шт.)
│   ├── Models/                # 18 Eloquent моделей
│   ├── Observers/             # ProductImageObserver
│   ├── Livewire/              # ImagePicker
│   └── Http/
├── database/
│   ├── migrations/            # 32 миграции
│   └── seeders/               # 19 seeders
├── config/
├── routes/web.php
├── docker-compose.yml
└── Makefile
```

## Docker Setup

### Контейнеры

- **spraby-api** (PHP-FPM 8.2)
- **spraby-api-nginx** (Nginx, port 8000)
- **spraby-api-postgres** (PostgreSQL 15, port 5435)

### Makefile команды

```bash
make up         # Start
make build      # Build & start
make bash       # Enter container
make migrate    # Run migrations
make seed       # Seed database
make fix-perms  # Fix permissions
```

## Ключевые особенности

### 1. Shared Database

```
Laravel API ──┐
              ├──> PostgreSQL
Next.js Store ─┘
```

**Важно**: Синхронизация Laravel migrations ↔ Prisma schema

### 2. Row Level Security

Менеджеры видят только свой бренд:

```php
public static function getEloquentQuery(): Builder {
    $query = parent::getEloquentQuery();
    if (Auth::user()?->hasRole('admin')) return $query;

    return $query->where('brand_id', Auth::user()->getBrand()->id);
}
```

### 3. AWS S3 Storage

Автоматическое удаление при delete:

```php
static::deleting(function (Image $image) {
    Storage::disk('s3')->delete($image->src);
});
```

### 4. Автоматическая привязка к бренду

```php
static::creating(function (Product $model) {
    $brand = auth()->user()->brands()->first();
    if ($brand) $model->brand_id = $brand->id;
});
```

## Development Commands

```bash
# Local
composer dev    # server + queue + logs + vite

# Docker
make up && make bash
php artisan migrate:fresh --seed
```

## Следующие шаги

- [Models →](./02-models.md)
- [Filament →](./03-filament.md)

[← Назад к оглавлению](./README.md)