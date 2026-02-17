---
name: spraby-project
description: Project-specific context for the Spraby API codebase. Use when working on any task inside api/ — adding pages, models, routes, components, or modifying the product/image/brand/order domain. Provides architecture decisions, file locations, naming conventions, and common pitfalls.
---

# Spraby Project Context

Multi-tenant e-commerce platform. The `api/` directory contains a Laravel 12 backend that also hosts the primary admin UI built with React 19 + Inertia.js.

## Critical Architecture Constraints

These are non-negotiable decisions already baked into the codebase:

| Constraint | Detail |
|---|---|
| **No soft deletes** | All deletions are hard deletes. Do not add `SoftDeletes` to models. |
| **No REST API for frontends** | The Next.js store and admin apps connect directly to PostgreSQL via Prisma. Laravel only serves the Inertia admin. |
| **Shared PostgreSQL database** | Any schema change must be mirrored in `admin/prisma/schema.prisma` and `store/prisma/schema.prisma`. |
| **BigInt IDs** | All model IDs are BigInt autoincrement. |
| **Decimal prices are strings** | `price` and `final_price` columns are `decimal(10,2)` but arrive in TypeScript as `string`. Never treat them as `number`. |
| **brand_id is auto-assigned** | Product and Image creation auto-sets `brand_id` from the authenticated user's brand. Never ask the user to provide it on create forms. |
| **Row-level security** | Managers only see data for their own brand. Admins see everything. Enforce in every controller/query. |

## Directory Map (api/)

```
app/
  Http/Controllers/Admin/     # Admin panel controllers (Inertia + JSON API)
  Http/Controllers/Api/       # Auth and category API controllers
  Models/                     # 21 Eloquent models
  Observers/                  # ProductImageObserver (S3 cleanup on Image delete)

resources/js/admin/
  app.tsx                     # Inertia entry point
  Pages/                      # One file per page (auto-discovered by Inertia)
  layouts/AdminLayout.tsx     # Wraps all authenticated pages
  components/
    ui/                       # shadcn/ui components (Button, Card, Input, etc.)
    data-table.tsx            # Reusable TanStack table
    app-sidebar.tsx           # Navigation sidebar
    image-picker.tsx          # Media library browser component
    image-picker-dialog.tsx   # Triggers openDialog() with <ImagePicker> inside
    image-selector.tsx        # Single/multi image selection UI
    product-form.tsx          # Product create/edit form with variants + images
    global-dialog.tsx         # Renders the Zustand dialog store in layout
  stores/
    dialog.ts                 # Zustand global dialog store (openDialog/closeDialog)
    save-bar.ts               # Zustand save bar store (hasChanges, isSaving, register)
  lib/
    utils.ts                  # cn() utility
    lang.ts                   # useLang() hook → t(), trans(), locale
  types/
    models.ts                 # All domain TypeScript interfaces
    inertia.d.ts              # Inertia PageProps augmentation

resources/lang/{en,ru}/admin.php   # Translation strings
resources/css/admin.css            # Tailwind 4 theme + CSS variables
routes/web.php                     # ALL routes (admin prefix group)
database/migrations/               # 32 migrations
```

## Domain Model Quick Reference

```
Brand
  hasMany Product, Image, BrandSettings, Order
  belongsToMany User, ShippingMethod

Product
  belongsTo Brand, Category
  hasMany Variant
  belongsToMany Image (through product_images pivot → ProductImage)

ProductImage        ← pivot record, has its OWN id and `position`
  belongsTo Product
  belongsTo Image (image_id → images.id)
  hasMany Variant   ← Variant.image_id points HERE (not to images.id)

Image               ← the actual S3 file record
  has url accessor  (always present, full S3 URL)

Variant
  belongsTo Product
  belongsTo ProductImage (image_id → product_images.id, nullable)
  belongsToMany OptionValue (through variant_values)

Option → hasMany OptionValue
Category → hasMany Option, Product
```

**Image ID distinction — this trips people up:**

- `BaseImageId` = `images.id` — the uploaded file record
- `ProductImageId` = `product_images.id` — the pivot/association record
- `Variant.image_id` points to `product_images.id` (a `ProductImageId`), NOT to `images.id`

## Routing Pattern

All routes live in `routes/web.php` under the `admin` prefix group.

```php
// Inertia page (renders React component)
Route::get('/things', [ThingController::class, 'index'])->name('things');
Route::get('/things/{thing}/edit', [ThingController::class, 'edit'])->name('things.edit');

// JSON API routes (used by TanStack Query in React, NOT Inertia navigation)
Route::get('/things/api', [ThingController::class, 'apiIndex'])->name('things.api.index');
Route::put('/things/{thing}/api', [ThingController::class, 'apiUpdate'])->name('things.api.update');
```

Convention: suffix JSON-only routes with `/api` in the URL and `.api.*` in the name.

## Controller Pattern

```php
// Inertia page response
public function edit(Product $product): Response
{
    // Row-level security check
    if (!Auth::user()->hasRole('admin')) {
        abort_unless($product->brand_id === Auth::user()->getBrand()->id, 403);
    }

    return Inertia::render('ProductEdit', [
        'product' => $product->load('variants.values.option', 'images.image'),
        'categories' => Category::all(['id', 'name']),
    ]);
}

// JSON API response (for TanStack Query)
public function apiUpdate(Request $request, Product $product): JsonResponse
{
    $validated = $request->validate([...]);
    $product->update($validated);
    return response()->json($product);
}
```

## React Page Component Pattern

```tsx
// resources/js/admin/Pages/ThingEdit.tsx
import { type PageProps } from '@/types/inertia';
import AdminLayout from '@/layouts/AdminLayout';
import { useLang } from '@/lib/lang';
import type { Thing } from '@/types/models';

interface Props extends PageProps {
    thing: Thing;
}

export default function ThingEdit({ thing }: Props) {
    const { t } = useLang();

    return (
        <div>
            <h1>{t('admin.things.edit')}</h1>
        </div>
    );
}

ThingEdit.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
```

## Global Dialog Pattern

One dialog instance lives in `<GlobalDialog />` (mounted in AdminLayout). Drive it from any component via Zustand:

```tsx
import { useDialog } from '@/stores/dialog';

const { openDialog, closeDialog } = useDialog();

openDialog({
    title: 'Select Images',
    className: 'max-w-[1000px] min-h-[300px] max-h-[80vh] overflow-y-auto',
    content: <MyComponent />,
    footer: <Button onClick={closeDialog}>Close</Button>,
});
```

**Stale closure pitfall**: If the footer button needs to read state that changes inside `content`, use `useRef` to bridge the closure gap — exactly how `ImagePickerDialog` does it:

```tsx
const selectedItemsRef = useRef<ImageSelectorItem[]>([]);

const onChooseHandle = useCallback(() => {
    onChoose(selectedItemsRef.current);   // ref always has latest value
    closeDialog();
}, [onChoose, closeDialog]);

openDialog({
    content: (
        <ImagePicker
            onChange={(items) => { selectedItemsRef.current = items; }}  // write to ref
        />
    ),
    footer: <Button onClick={onChooseHandle}>Choose</Button>,   // reads ref, not stale state
});
```

## Save Bar Pattern

Pages with unsaved changes show a sticky save/discard bar via the `useSaveBar` hook:

```tsx
import { useSaveBar } from '@/stores/save-bar';

useSaveBar({
    hasChanges,          // boolean — show bar when true
    isSaving,            // boolean — loading state
    onSave: async () => {
        // perform save, return true on success / false on failure
        return true;
    },
    onDiscard: () => {
        // reset local state
    },
});
```

## i18n Pattern

```tsx
import { useLang } from '@/lib/lang';

const { t, trans, locale } = useLang();

t('admin.products.title')                        // simple key
trans('admin.welcome', { name: 'John' })         // with replacements (:name or {name})
locale                                           // 'en' | 'ru'
```

Translation files: `resources/lang/en/admin.php` and `resources/lang/ru/admin.php`.

## Tailwind CSS 4 Syntax (breaking changes from v3)

| v3 | v4 (use this) |
|---|---|
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `!p-4` | `p-4!` |
| `bg-[--color]` | `bg-(--color)` |
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `ring` (3px) | `ring-3` |
| `outline-none` | `outline-hidden` |
| `rounded-sm` | `rounded-xs` |

Always use theme CSS variables, never hardcoded colors:
- `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`
- `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-destructive`
- Always add `dark:` variants when hardcoding is unavoidable.

## Styling Rules

- Use `cn()` from `@/lib/utils` for conditional class merging.
- Use shadcn/ui components from `@/components/ui/` — never build raw UI primitives.
- No inline styles — Tailwind classes only.
- Import icons from `lucide-react`.

## Common Workflows

### Add a field to an existing model

1. `php artisan make:migration add_field_to_table_name` inside Docker
2. Update `$fillable` in the Eloquent model (`app/Models/`)
3. Update TypeScript interface in `resources/js/admin/types/models.ts`
4. Update `admin/prisma/schema.prisma` AND `store/prisma/schema.prisma`
5. Run `make migrate` then `npm run db:generate` in both Next.js apps

### Create a new admin page

1. Create `resources/js/admin/Pages/YourPage.tsx` with `.layout` assigned
2. Add the route in `routes/web.php` inside the `admin` + `auth` group:
   ```php
   Route::get('/your-page', [YourController::class, 'index'])->name('your-page');
   ```
3. Add navigation entry in `resources/js/admin/components/app-sidebar.tsx` if needed
4. Add translation keys to both `resources/lang/en/admin.php` and `resources/lang/ru/admin.php`

### Install a Composer package

Always inside Docker:
```bash
docker exec -it spraby-api composer require vendor/package
# or: make bash && composer require vendor/package
```

### Install a shadcn/ui component

```bash
npx shadcn@latest add component-name
```

### Image management (product images)

```
POST   admin.products.images.attach  body: { image_ids: number[] }   # attach existing images
POST   admin.products.images.upload  multipart                         # upload new files
DELETE admin.products.images.detach/{productImageId}                   # detach (hard delete pivot + S3)
PUT    admin.products.images.reorder body: { image_ids: number[] }    # reorder by position
```

Use `<ImagePickerDialog onChoose={handler} />` to let users pick from the media library.

### Row-level security in a new controller

```php
public function index(): Response
{
    $query = Product::query();

    if (!Auth::user()->hasRole('admin')) {
        $query->where('brand_id', Auth::user()->getBrand()->id);
    }

    return Inertia::render('Products', ['products' => $query->get()]);
}
```

### Clear all Laravel caches

```bash
php artisan config:clear && php artisan cache:clear && php artisan view:clear && php artisan route:clear
```

## Docker Commands

```bash
make up / down / build / restart    # container lifecycle
make bash                           # shell into spraby-api (PHP-FPM)
make migrate                        # run pending migrations
make seed                           # seed the database
make logs                           # tail container logs
make psql                           # PostgreSQL shell
```

## Key Named Routes (Ziggy)

```
admin.dashboard
admin.products, admin.products.create, admin.products.edit, admin.products.store, admin.products.update, admin.products.destroy
admin.products.images.attach, admin.products.images.upload, admin.products.images.detach, admin.products.images.reorder
admin.brands, admin.brands.create, admin.brands.edit, admin.brands.store, admin.brands.update, admin.brands.destroy
admin.orders, admin.orders.show, admin.orders.update-status
admin.users, admin.users.edit
admin.media, admin.media.api.index, admin.media.store
admin.categories, admin.collections, admin.options
admin.settings
admin.login, admin.logout
admin.impersonate, admin.impersonate.stop
set-locale
```

## Pitfalls to Avoid

- Do NOT add soft deletes to any model — the codebase is hard-delete only.
- Do NOT treat `price` / `final_price` as numbers — they are `string` in TypeScript.
- Do NOT reference `Variant.image_id` as an `images.id` — it points to `product_images.id`.
- Do NOT install Composer packages on the host machine — always use the Docker container.
- Do NOT use Tailwind v3 syntax (e.g. `!p-4`, `bg-gradient-to-r`, `shadow-sm` for the small shadow).
- Do NOT create custom UI components when a shadcn/ui equivalent exists.
- Do NOT hardcode colors — use theme CSS variables.
- Do NOT forget to update both Prisma schemas when changing the DB schema.
- Do NOT pass `brand_id` from create forms — it is auto-assigned server-side.
- Do NOT use `openDialog` with a state-capturing footer callback without a `useRef` bridge (stale closure bug).
