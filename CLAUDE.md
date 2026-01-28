# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Directory Restriction

**MANDATORY**: Work is performed ONLY in `/home/cmuvr/comp/PROGECTS/SMUVR/spraby/spraby/api/`

- All tasks, commands, and operations are executed ONLY inside `api/`
- If work with other parts of the project (admin, store) is required, the user must explicitly switch the working directory

## Project Overview

Laravel 12 backend API with React/Inertia admin UI for an e-commerce platform. Uses Docker for containerization and PostgreSQL 15 as database.

**Key Architecture Point**: This API shares a PostgreSQL database with Next.js frontend applications (admin and store). The frontend apps access the database directly via Prisma, while this Laravel API provides the React/Inertia admin interface.

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
- **@tanstack/react-table**: Table component
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
├── Models/                # Eloquent models (21 models total)
├── Observers/             # ProductImageObserver for S3 cleanup
└── Http/
    ├── Controllers/
    │   ├── Admin/         # Admin panel controllers
    │   ├── Api/           # API controllers (auth, etc.)
    │   └── Auth/          # Authentication controllers
    └── Middleware/        # Custom middleware

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
│   └── admin.css          # Admin UI styles (Tailwind 4)
└── lang/                  # Localization files (en, ru)

database/
├── migrations/            # Database migrations
└── seeders/               # Database seeders

routes/web.php             # Routes (React admin pages)
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
- **Image/ProductImage**: Image management with S3 integration

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

Managers can only see data for their assigned brand(s). This is enforced in controllers:

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

When creating Products or Images, the `brand_id` is automatically set based on the authenticated user's brand.

## Environment Configuration

Copy `.env.example` to `.env` and configure:

**Database** (for Docker setup):
```env
DB_CONNECTION=pgsql
DB_HOST=spraby-api-postgres
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=password
```

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

**CRITICAL**: ALWAYS install Composer dependencies inside the Docker container:

```bash
docker exec -it spraby-api composer require package/name
# or: make bash && composer require package/name
```

### Clearing caches

```bash
php artisan config:clear && php artisan cache:clear && php artisan view:clear && php artisan route:clear
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

All React admin routes are prefixed with `/admin` and use the `inertia` middleware:

```php
Route::prefix('admin')->name('admin.')->middleware('inertia')->group(function () {
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
2. Add route in `routes/web.php` inside the `admin` group:
   ```php
   Route::get('/your-page', function () {
       return Inertia::render('YourPage', [
           'data' => YourModel::all(),
       ]);
   })->name('your-page');
   ```
3. URL will be: `http://localhost:8000/admin/your-page`

**Important Routes**:
- `/admin` - Dashboard (requires auth)
- `/admin/login` - Login page (guest only)
- `/admin/users` - User management
- `/set-locale/{locale}` - Language switcher (en/ru)

### shadcn/ui Components

**CRITICAL**: Always use shadcn/ui components for UI development.

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

### Tailwind CSS 4

**CRITICAL**: The project uses **Tailwind CSS 4.x**.

**Key syntax changes v3 → v4**:
- Gradients: `bg-gradient-to-r` → `bg-linear-to-r`
- !important: `!p-4` → `p-4!` (suffix instead of prefix)
- CSS variables: `bg-[--color]` → `bg-(--color)` (parentheses)
- Shadows: `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
- Rings: `ring` → `ring-3` (width changed from 3px to 1px)
- Outline: `outline-none` → `outline-hidden`
- Rounded: `rounded-sm` → `rounded-xs`

**Theme Configuration** (`resources/css/admin.css`):
- Uses `@theme inline` block for custom CSS variables
- Dark mode via `.dark` class on `<html>` element
- Custom color palette: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`

**Styling rules**:
- Use `cn()` utility for conditional classes (from `lib/utils.ts`)
- Use theme CSS variables instead of hardcoded colors
- Always add `dark:` variants for theme-aware styling

### Route Helpers (Ziggy)

The project uses **Ziggy** to generate TypeScript-safe route helpers from Laravel routes.

```tsx
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Navigate with Inertia (SPA-style, no page reload)
router.visit(route('admin.users'));
router.get(route('admin.users.edit', { id: 1 }));
```

### Localization (i18n)

The admin UI supports English (`en`) and Russian (`ru`) locales.

**Translation Files**:
- `resources/lang/{locale}/admin.php` - Admin UI translations

**Using translations in React**:
```tsx
import { useLang } from '@/lib/lang';

const { t, lang } = useLang();
// t('admin.welcome') - translation function
// lang - current locale ('en' | 'ru')
```

## Build Configuration

### Vite Setup (`vite.config.js`)

The project uses Vite 6 with the following plugins:
- **laravel-vite-plugin**: Laravel integration
- **@vitejs/plugin-react**: React support with automatic JSX runtime
- **@tailwindcss/vite**: Tailwind CSS 4 processing
- **@nabla/vite-plugin-eslint**: ESLint integration (admin directory only)

**Path alias**: `@` → `resources/js/admin/`

**Entry points**:
- `resources/css/admin.css` - Admin UI styles
- `resources/js/admin/app.tsx` - React/Inertia app

### ESLint Configuration

Linting is configured for TypeScript/React code in `resources/js/admin/`:
- **Run lint**: `npm run lint`
- **Auto-fix**: `npm run lint:fix`

## Task Management Workflow

When the user writes the word **"Задача"** (Task):

1. **Create a task file** in `.claude/.tasks/` with format: `YYYY-MM-DD-short-description.md`
2. **Create a todo list** with checkboxes `- [ ]` for each action
3. **Mark as checked** (`- [x]`) each completed item as you progress
4. **NEVER start execution** until the command **"выполняем"** (execute) - only document the task until then
5. **Run lint check** after completing the task (`npm run lint`)

## Important Notes

- **No Soft Deletes**: All deletions are hard deletes
- **No REST API**: The Next.js frontend apps connect directly to the database via Prisma
- **React Admin Uses Inertia**: The React admin (`/admin`) uses Inertia.js for SPA-like navigation
- **Localization**: Supports English (en) and Russian (ru)
- **Queue System**: Uses database driver for background jobs
- **Observer Pattern**: Used for lifecycle hooks (e.g., S3 cleanup on image deletion)

## Development Best Practices

### React Admin UI

- Always use shadcn/ui components - never build UI primitives from scratch
- TypeScript for all components - type props, state, and data
- Use `cn()` for class merging from `@/lib/utils`
- Follow Tailwind 4 syntax
- No inline styles - use Tailwind classes exclusively
- No hardcoded colors - use theme CSS variables
- Server state in Inertia props - pass data from controllers
- Use Inertia router for navigation

### Backend Development

- Use Eloquent ORM - no raw SQL queries
- Type hint parameters - modern PHP type safety
- Resource controllers - RESTful naming conventions
- Route groups - organize by middleware and prefix
- Return Inertia responses - `Inertia::render('Page', $data)`
- Named routes - always name routes for Ziggy
