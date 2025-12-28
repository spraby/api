# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ КРИТИЧЕСКОЕ ОГРАНИЧЕНИЕ РАБОЧЕЙ ОБЛАСТИ

**ОБЯЗАТЕЛЬНОЕ ПРАВИЛО**: Работа ведётся ТОЛЬКО в директории `/home/cmuvr/comp/PROGECTS/SMUVR/spraby/spraby/api/`

- ❌ ЗАПРЕЩЕНО выходить за пределы этой директории
- ❌ ЗАПРЕЩЕНО читать, изменять или создавать файлы вне `/home/cmuvr/comp/PROGECTS/SMUVR/spraby/spraby/api/`
- ❌ ЗАПРЕЩЕНО обращаться к родительским директориям (`../admin/`, `../store/`, и т.д.)
- ✅ Все задачи, команды и операции выполняются ТОЛЬКО внутри `api/`

Если потребуется работа с другими частями проекта (admin, store), пользователь должен явно переключить рабочую директорию.

## Project Overview

Laravel 12 backend API with Filament 4.0 admin panel and React/Inertia admin UI for an e-commerce platform. Uses Docker for containerization and PostgreSQL 15 as database.

**Key Architecture Point**: This API shares a PostgreSQL database with Next.js frontend applications (admin and store). The frontend apps access the database directly via Prisma, while this Laravel API provides the Filament admin panel for content management and a React/Inertia admin interface.

## Development Commands

### Docker (Recommended)

```bash
make up              # Start containers
make build           # Build and start containers
make down            # Stop containers
make restart         # Rebuild and restart containers
make bash            # Access PHP container shell
make migrate         # Run migrations
make seed            # Seed database
make logs            # View container logs
make psql            # Access PostgreSQL shell
make composer        # Install composer dependencies
make fix-perms       # Fix storage and cache permissions
```

### Local Development

```bash
composer dev         # Runs server, queue, logs, and vite concurrently
php artisan serve    # Start development server (port 8000)
php artisan migrate  # Run database migrations
php artisan db:seed  # Seed the database
php artisan pail     # View logs in real-time
npm run dev          # Run Vite for asset compilation
npm run build        # Build assets for production
npm run lint         # Lint admin frontend code
npm run lint:fix     # Auto-fix linting issues
```

### Testing

```bash
vendor/bin/phpunit                    # Run all tests
vendor/bin/phpunit tests/Unit         # Run unit tests only
vendor/bin/phpunit tests/Feature      # Run feature tests only
vendor/bin/phpunit --filter TestName  # Run specific test
```

## Architecture

### Technology Stack

**Backend:**
- **Laravel**: 12.x
- **PHP**: 8.2+
- **Filament**: 4.0 (Admin Panel)
- **PostgreSQL**: 15 (port 5435)
- **Spatie Laravel Permission**: Role-based access control
- **AWS S3**: Image storage via league/flysystem-aws-s3-v3

**Frontend (Admin UI at `/resources/js/admin/`):**
- **React**: 19.x
- **Inertia.js**: 2.x (React adapter)
- **TypeScript**: 5.x
- **shadcn/ui**: Component library based on Radix UI
- **Tailwind CSS**: 4.x
- **Vite**: 6.x

### Docker Setup

Three containers:
- `spraby-api` (PHP-FPM 8.2)
- `spraby-api-nginx` (Nginx, exposed on port 8000)
- `spraby-api-postgres` (PostgreSQL 15, exposed on port 5435)

### Project Structure

```
app/
├── Filament/Resources/    # Filament CRUD resources (11 resources)
├── Models/                # Eloquent models (21 models total)
├── Observers/             # ProductImageObserver for S3 cleanup
├── Livewire/              # Custom Livewire components
└── Http/                  # Controllers and middleware

resources/
├── js/admin/              # React/Inertia admin UI
│   ├── app.tsx            # Inertia entry point
│   ├── Pages/             # Page components
│   ├── layouts/           # Layout components
│   ├── components/ui/     # shadcn/ui components
│   ├── lib/               # Utilities (utils.ts)
│   └── types/             # TypeScript types
└── css/
    ├── admin.css          # Admin UI styles (Tailwind 4)
    └── app.css            # Filament styles

database/
├── migrations/            # 32 database migrations
└── seeders/               # 19 seeders (orchestrated via DatabaseSeeder)

routes/web.php             # Routes (Filament + React admin pages)
```

### Key Domain Models

All models use BigInt autoincrement IDs. Total: **21 models**

**Core Models:**
- **User**: Authentication with roles (admin, manager) via Spatie Permission
- **Brand**: Multi-tenant support with BrandSettings
- **Product**: Main product catalog with variants, options, and images
- **Variant**: Product variations (e.g., size, color combinations)
- **Option/OptionValue**: Product options (e.g., Size: S, M, L)
- **Category**: Product categorization
- **Collection**: Product groupings
- **Order/OrderItem/OrderShipping**: Complete order management
- **Customer**: Customer data
- **Image/ProductImage**: Image management with S3 integration

**Additional Models:**
- **Audit**: Audit logging
- **Permission**: Spatie permission system
- **Settings**: Application settings
- **ProductStatistics**: Product statistics tracking
- **VariantValue**: Variant option values pivot

Key relationships:
- Product hasMany Variants
- Variant belongsToMany OptionValues (through variant_values pivot)
- Product belongsToMany Images (through product_images)
- User belongsToMany Brands (managers can belong to multiple brands)

### Critical Architecture Patterns

#### 1. Shared Database with Next.js

The PostgreSQL database is accessed by both:
- This Laravel API (via Eloquent)
- Next.js admin/store apps (via Prisma)

**IMPORTANT**: When modifying the database schema, you must:
1. Update Laravel migrations in `database/migrations/`
2. Update Prisma schemas in `admin/prisma/schema.prisma` and `store/prisma/schema.prisma`
3. Run migrations/generate for both systems

#### 2. Row Level Security

Managers can only see data for their assigned brand(s). This is enforced in Filament Resources:

```php
public static function getEloquentQuery(): Builder {
    $query = parent::getEloquentQuery();
    if (Auth::user()?->hasRole('admin')) return $query;

    return $query->where('brand_id', Auth::user()->getBrand()->id);
}
```

#### 3. AWS S3 Image Storage

Images are stored in S3. The `ProductImageObserver` automatically deletes files from S3 when an Image model is deleted.

#### 4. Automatic Brand Assignment

When creating Products or Images, the `brand_id` is automatically set based on the authenticated user's brand:

```php
static::creating(function (Product $model) {
    $brand = auth()->user()->brands()->first();
    if ($brand) $model->brand_id = $brand->id;
});
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

**Database** (for Docker setup, override .env.example defaults):
```env
DB_CONNECTION=pgsql
DB_HOST=spraby-api-postgres
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=password
```

Note: `.env.example` uses SQLite by default for quick local setup.

**AWS S3** (required for image uploads):
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket
```

## Development Workflow

### Initial Setup

```bash
# Docker
make build
make bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
npm install
npm run build
exit

# Local
composer install
php artisan key:generate
php artisan migrate:fresh --seed
npm install
composer dev  # Starts everything
```

### Installing Dependencies

**CRITICAL**: ALWAYS install Composer dependencies inside the Docker container, NEVER locally:

```bash
# Correct way - inside Docker container
docker exec -it spraby-api composer require package/name
docker exec -it spraby-api composer require --dev package/name

# Alternative - enter container first
make bash
composer require package/name
exit

# WRONG - never do this
composer require package/name  # ❌ Don't run locally
```

### Common Tasks

**Adding a new field to a model**:
1. Create migration: `php artisan make:migration add_field_to_table`
2. Update the model's `$fillable` array
3. Update Filament Resource form/table if applicable
4. Update Next.js Prisma schema if the frontend needs access

**Creating a new Filament Resource**:
```bash
php artisan make:filament-resource ModelName --generate
```

**Clearing caches**:
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

## Frontend Development Guidelines

### React/Inertia Admin UI

The admin UI is built with React 19 + Inertia.js in `resources/js/admin/`.

**Key Points:**
- Entry point: `resources/js/admin/app.tsx`
- Pages auto-loaded from `resources/js/admin/Pages/`
- Uses TypeScript for type safety
- Inertia provides SPA-like navigation without API endpoints
- Server-side state passed as Inertia props from Laravel controllers

**Creating a new page:**
1. Create component in `resources/js/admin/Pages/YourPage.tsx`
2. Add route in `routes/web.php`:
   ```php
   Route::get('/admin/your-page', function () {
       return Inertia::render('YourPage', [
           'data' => YourModel::all(),
       ]);
   });
   ```

### shadcn/ui Components

**КРИТИЧЕСКОЕ ПРАВИЛО**: При разработке UI ВСЕГДА использовать компоненты shadcn/ui.

Components are located in `resources/js/admin/components/ui/`. Available components include:
- **Layout**: `sidebar`, `card`, `separator`, `accordion`
- **Forms**: `select`, `input`, `checkbox`, `switch`, `label`
- **Buttons**: `button`, `toggle`, `toggle-group`
- **Overlays**: `dialog`, `dropdown-menu`, `tooltip`, `alert-dialog`
- **Data Display**: `badge`, `avatar`, `tabs`, `table` (@tanstack/react-table)
- **Feedback**: `sonner` (toast notifications)

**Installing new shadcn components:**
```bash
npx shadcn@latest add component-name
```

**Usage example:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Tailwind CSS 4

**КРИТИЧЕСКОЕ ПРАВИЛО**: В проекте используется **Tailwind CSS 4.x** - ВСЕГДА использовать Tailwind для стилизации.

**⚠️ ОБЯЗАТЕЛЬНО**: Перед написанием стилей проверить документацию: https://tailwindcss.com/docs

**Ключевые изменения синтаксиса v3 → v4**:
- Градиенты: `bg-gradient-to-r` → `bg-linear-to-r`
- !important: `!p-4` → `p-4!` (суффикс вместо префикса)
- CSS переменные: `bg-[--color]` → `bg-(--color)` (круглые скобки)
- Тени: `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
- Кольца: `ring` → `ring-3` (ширина изменена с 3px на 1px)
- Outline: `outline-none` → `outline-hidden`
- Скругления: `rounded-sm` → `rounded-xs`
- Порядок вариантов: `first:*:pt-0` → `*:first:pt-0` (left-to-right)

**Theme Configuration** (`resources/css/admin.css`):
- Uses `@theme inline` block for custom CSS variables
- Dark mode via `.dark` class on `<html>` element
- Custom color palette: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-*`, `sidebar-*`
- Managed by `next-themes` package

**Правила стилизации**:
- ✅ **Tailwind классы в JSX** - всегда предпочтительнее
- ✅ **cn() utility** для условных классов (from `lib/utils.ts`)
- ✅ **CSS переменные темы** - использовать color palette вместо жёстко заданных цветов
- ❌ **Избегать inline styles** - использовать Tailwind классы

**Пример использования cn():**
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
  isActive && "bg-primary text-primary-foreground",
  !isActive && "bg-muted hover:bg-muted/80"
)} />
```

### TypeScript Types

Type definitions in `resources/js/admin/types/`:
- `models.ts` - Domain model types (User, Product, etc.)
- `inertia.d.ts` - Inertia page props types
- `global.d.ts` - Global type augmentations

Always type your components and props:
```tsx
import { PageProps } from '@/types/inertia';

interface DashboardProps extends PageProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
  };
}

export default function Dashboard({ auth, stats }: DashboardProps) {
  // Component logic
}
```

## Testing

Configuration in `phpunit.xml`. Tests use array cache and database queue by default.

## Task Management Workflow

**ОБЯЗАТЕЛЬНЫЕ ИНСТРУКЦИИ**: Когда пользователь пишет слово **"Задача"**:

1. **Создать файл задачи** в `.claude/.tasks/` с именем формата: `YYYY-MM-DD-краткое-описание.md`
2. **Внутри файла создать @todo лист** с чекбоксами `- [ ]` для каждого действия, раздела, подраздела
3. **Проставлять как checked** (`- [x]`) каждый выполненный пункт по мере выполнения
4. **НИКОГДА не начинать выполнение** до команды **"выполняем"** - до этого только документировать задачу в файле

**Пример структуры файла задачи**:
```markdown
# Название задачи

Дата создания: YYYY-MM-DD

## Описание
[Краткое описание задачи]

## Чеклист

- [ ] Раздел 1: Подготовка
  - [ ] Подпункт 1.1
  - [ ] Подпункт 1.2
- [ ] Раздел 2: Реализация
  - [ ] Подпункт 2.1
  - [ ] Подпункт 2.2
- [ ] Раздел 3: Тестирование
  - [ ] Подпункт 3.1
```

## Important Notes

- **No Soft Deletes**: All deletions are hard deletes
- **No REST API**: The frontend connects directly to the database via Prisma, not through Laravel API endpoints
- **Localization**: Supports English (en) and Russian (ru)
- **Queue System**: Uses database driver for background jobs
- **Observer Pattern**: Used for lifecycle hooks (e.g., S3 cleanup on image deletion)
- **shadcn/ui First**: Always prefer shadcn/ui components over custom solutions
- **Type Safety**: Always use TypeScript types for components and data
