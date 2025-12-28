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
- **Inertia.js**: 2.x (React adapter) - SPA-like navigation
- **TypeScript**: 5.x
- **shadcn/ui**: Component library based on Radix UI primitives
- **Tailwind CSS**: 4.x
- **Vite**: 6.x
- **next-themes**: Dark mode management
- **@tanstack/react-table**: Table component (used in data-table.tsx)
- **sonner**: Toast notifications
- **lucide-react**: Icon library
- **Ziggy**: TypeScript-safe Laravel route helpers
- **zod**: Schema validation

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
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── *.tsx          # Custom components
│   ├── lib/               # Utilities (utils.ts, lang.ts)
│   └── types/             # TypeScript types
├── css/
│   ├── admin.css          # Admin UI styles (Tailwind 4)
│   └── app.css            # Filament styles
└── lang/                  # Localization files
    ├── en/                # English
    │   ├── admin.php      # Admin UI translations
    │   └── filament-*.php # Filament translations
    └── ru/                # Russian
        ├── admin.php      # Admin UI translations
        └── filament-*.php # Filament translations

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

**Routing Structure** (`routes/web.php`):

All React admin routes are prefixed with `/sb/admin` and use the `inertia` middleware:

```php
Route::prefix('sb/admin')->name('sb.admin.')->middleware('inertia')->group(function () {
    // Guest routes (login, register)
    Route::middleware('guest')->group(function () {
        Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');
    });

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::get('/', fn() => Inertia::render('Dashboard'))->name('dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users');
    });
});
```

**Creating a new page:**
1. Create component in `resources/js/admin/Pages/YourPage.tsx`
2. Add route in `routes/web.php` inside the `sb/admin` group:
   ```php
   Route::get('/your-page', function () {
       return Inertia::render('YourPage', [
           'data' => YourModel::all(),
       ]);
   })->name('your-page');
   ```
3. URL will be: `http://localhost:8000/sb/admin/your-page`

**Important Routes**:
- `/sb/admin` - Dashboard (requires auth)
- `/sb/admin/login` - Login page (guest only)
- `/sb/admin/users` - User management
- `/set-locale/{locale}` - Language switcher (en/ru)

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

### Utility Functions

**`lib/utils.ts`** - Core utilities:
```tsx
import { cn } from '@/lib/utils';

// Merge Tailwind classes with conflict resolution
cn("px-2 py-1", "px-4") // Result: "py-1 px-4"

// Conditional classes
cn("base-class", condition && "conditional-class")
```

**`lib/lang.ts`** - Localization hook:
```tsx
import { useLang } from '@/lib/lang';

const { t, lang } = useLang();
// t() - translation function
// lang - current locale ('en' | 'ru')
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

### Localization (i18n)

The admin UI supports English (`en`) and Russian (`ru`) locales.

**Translation Files**:
- `resources/lang/{locale}/admin.php` - Admin UI translations
- `resources/lang/{locale}/filament-*.php` - Filament panel translations

**Using translations in React**:
```tsx
import { useLang } from '@/lib/lang';

export default function MyComponent() {
  const { t, lang } = useLang();

  return (
    <h1>{t('admin.welcome')}</h1>
  );
}
```

**Adding new translation keys**:
1. Add key to `resources/lang/en/admin.php`
2. Add corresponding translation to `resources/lang/ru/admin.php`
3. Use via `t('admin.your_key')` in components

**Important**: The `useLang()` hook uses Laravel's lang sync package (`erag/laravel-lang-sync-inertia`) to inject translations into Inertia props. Translations are automatically available on the client without additional requests.

### Route Helpers (Ziggy)

The project uses **Ziggy** (`tightenco/ziggy`) to generate TypeScript-safe route helpers from Laravel routes.

**Usage in React components**:
```tsx
import { route } from 'ziggy-js';

export default function MyComponent() {
  const handleClick = () => {
    // Navigate using named routes
    window.location.href = route('sb.admin.users');

    // With parameters
    window.location.href = route('sb.admin.users.edit', { id: 1 });
  };

  return <button onClick={handleClick}>Go to Users</button>;
}
```

**With Inertia router**:
```tsx
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Navigate with Inertia (SPA-style, no page reload)
router.visit(route('sb.admin.users'));
router.get(route('sb.admin.users.edit', { id: 1 }));
```

### Controllers

**Admin Controllers** (`app/Http/Controllers/Admin/`):
- `UserController.php` - User management (CRUD, bulk operations)

**API Controllers** (`app/Http/Controllers/Api/`):
- `AuthController.php` - Authentication (login, register, logout)
- `ProductController.php` - Product API endpoints
- `CategoryController.php` - Category API endpoints
- `BrandController.php` - Brand API endpoints

**Auth Controllers** (`app/Http/Controllers/Auth/`):
- Standard Laravel authentication controllers (Breeze-style)

### Middleware

**Custom Middleware** (`app/Http/Middleware/`):

1. **`HandleInertiaRequests.php`**
   - Shares common data with all Inertia pages
   - Injects auth user, flash messages, errors
   - Used automatically by Inertia

2. **`SetLocale.php`**
   - Sets application locale from session
   - Applied globally to all requests
   - Supports `en` and `ru` locales

3. **`Authenticate.php`**
   - Standard Laravel authentication middleware
   - Redirects unauthenticated users to login

**Usage in routes**:
```php
Route::middleware('auth')->group(function () {
    // Protected routes
});

Route::middleware('inertia')->group(function () {
    // Inertia routes with shared data
});
```

## Build Configuration

### Vite Setup (`vite.config.js`)

The project uses Vite 6 with the following plugins:
- **laravel-vite-plugin**: Laravel integration, handles CSS/JS bundling
- **@vitejs/plugin-react**: React support with automatic JSX runtime
- **@vitejs/plugin-vue**: Vue support (for Filament components)
- **@tailwindcss/vite**: Tailwind CSS 4 processing
- **@nabla/vite-plugin-eslint**: ESLint integration (admin directory only)

**Path alias**: `@` → `resources/js/admin/`

**Entry points**:
- `resources/css/app.css` - Filament styles
- `resources/css/admin.css` - Admin UI styles
- `resources/js/admin/app.tsx` - React/Inertia app

**Development server**: Hot Module Replacement (HMR) enabled for `.tsx` files

### ESLint Configuration

Linting is configured for TypeScript/React code in `resources/js/admin/`:
- **Run lint**: `npm run lint`
- **Auto-fix**: `npm run lint:fix`
- Configured rules: TypeScript, React, React Hooks, Import order

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
- **No REST API**: The Next.js frontend apps (admin/store) connect directly to the database via Prisma
- **React Admin Uses Inertia**: The React admin (`/sb/admin`) uses Inertia.js for SPA-like navigation
- **Localization**: Supports English (en) and Russian (ru)
- **Queue System**: Uses database driver for background jobs
- **Observer Pattern**: Used for lifecycle hooks (e.g., S3 cleanup on image deletion)

## Development Best Practices

### React Admin UI

**Component Development**:
- ✅ **Always use shadcn/ui components** - Never build UI primitives from scratch
- ✅ **TypeScript for all components** - Type props, state, and data
- ✅ **Use `cn()` for class merging** - From `@/lib/utils`
- ✅ **Follow Tailwind 4 syntax** - Use `()` for CSS vars, `bg-linear-*` for gradients
- ❌ **No inline styles** - Use Tailwind classes exclusively
- ❌ **No hardcoded colors** - Use theme CSS variables

**State Management**:
- ✅ **Server state in Inertia props** - Pass data from controllers
- ✅ **Client state in React hooks** - `useState`, `useReducer`
- ✅ **Form handling with controlled components**
- ✅ **Use Inertia router for navigation** - No window.location redirects

**Styling**:
- ✅ **Dark mode support** - Always add `dark:` variants
- ✅ **Responsive design** - Use mobile-first breakpoints
- ✅ **Accessibility** - Use semantic HTML and ARIA attributes
- ✅ **Theme colors** - `background`, `foreground`, `primary`, `secondary`, etc.

**File Organization**:
- `Pages/` - Page components (route targets)
- `components/` - Reusable components
- `components/ui/` - shadcn/ui components (don't modify)
- `layouts/` - Layout wrappers
- `lib/` - Utility functions and hooks
- `types/` - TypeScript type definitions

### Backend Development

**Laravel Best Practices**:
- ✅ **Use Eloquent ORM** - No raw SQL queries
- ✅ **Type hint parameters** - Modern PHP type safety
- ✅ **Resource controllers** - RESTful naming conventions
- ✅ **Route groups** - Organize by middleware and prefix
- ✅ **Validation requests** - Use Form Request classes
- ✅ **Database transactions** - For multi-step operations

**Inertia Integration**:
- ✅ **Return Inertia responses** - `Inertia::render('Page', $data)`
- ✅ **Share common data** - Use `HandleInertiaRequests` middleware
- ✅ **Flash messages** - `session()->flash()` for notifications
- ✅ **Named routes** - Always name routes for Ziggy

**Security**:
- ✅ **Middleware protection** - `auth` for protected routes
- ✅ **CSRF protection** - Enabled by default
- ✅ **Input validation** - Validate all user input
- ✅ **Mass assignment protection** - Use `$fillable` arrays
