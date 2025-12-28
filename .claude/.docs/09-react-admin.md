# React Admin Panel - shadcn/ui + Inertia.js

**Дата обновления**: 2025-12-28
**Версия**: React 19 + Inertia 2 + shadcn/ui

[← Назад к оглавлению](README.md)

## Обзор

**React Admin Panel** - это современная административная панель, построенная на React 19 с использованием Inertia.js для SPA-like навигации и shadcn/ui для UI компонентов.

### Ключевые особенности

- **React 19** - последняя версия React с улучшенной производительностью
- **Inertia.js 2** - SPA-навигация без REST API
- **shadcn/ui** - компоненты на основе Radix UI primitives
- **TypeScript** - полная типизация
- **Tailwind CSS 4** - современная утилитарная CSS система
- **Vite 6** - быстрая сборка с HMR
- **next-themes** - управление темной темой
- **Ziggy** - TypeScript-safe Laravel route helpers

## Архитектура

### Структура проекта

```
resources/js/admin/
├── app.tsx                  # Entry point, Inertia setup
├── lib/
│   ├── utils.ts             # cn() utility, helpers
│   └── lang.ts              # i18n utilities (useLang hook)
├── types/
│   ├── models.ts            # Domain model types (User, Product, etc.)
│   ├── inertia.d.ts         # Inertia PageProps types
│   └── global.d.ts          # Global augmentations
├── layouts/
│   └── AdminLayout.tsx      # Main layout with sidebar
├── components/
│   ├── ui/                  # shadcn/ui components (don't modify)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (40+ components)
│   ├── app-sidebar.tsx      # Navigation sidebar
│   ├── site-header.tsx      # Header component
│   ├── theme-toggle.tsx     # Dark mode toggle
│   ├── language-toggle.tsx  # i18n switcher (en/ru)
│   ├── nav-user.tsx         # User menu
│   ├── data-table.tsx       # Reusable table with sorting/filtering
│   └── users-table.tsx      # Users table component
└── Pages/                   # Page components (route targets)
    ├── Dashboard.tsx
    ├── Users.tsx
    ├── UserEdit.tsx
    └── Auth/
        ├── Login.tsx
        └── Register.tsx
```

### Роутинг

Все React admin маршруты находятся в `routes/web.php` с префиксом `/sb/admin`:

```php
Route::prefix('sb/admin')->name('sb.admin.')->middleware('inertia')->group(function () {
    // Guest routes
    Route::middleware('guest')->group(function () {
        Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::get('/', fn() => Inertia::render('Dashboard'))->name('dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});
```

**URL примеры**:
- `http://localhost:8000/sb/admin` - Dashboard
- `http://localhost:8000/sb/admin/login` - Login
- `http://localhost:8000/sb/admin/users` - Users list

## shadcn/ui Components

### Установка компонентов

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add sidebar
```

### Доступные компоненты

**Layout**:
- `sidebar` - Collapsible sidebar with Radix UI
- `card` - Card container
- `separator` - Visual separator
- `accordion` - Collapsible sections

**Forms**:
- `input` - Text input
- `select` - Dropdown select
- `checkbox` - Checkbox
- `switch` - Toggle switch
- `label` - Form label
- `button` - Button with variants

**Overlays**:
- `dialog` - Modal dialog
- `dropdown-menu` - Dropdown menu
- `tooltip` - Tooltip
- `alert-dialog` - Alert dialog
- `sheet` - Slide-out panel
- `drawer` - Bottom drawer (mobile)

**Data Display**:
- `badge` - Badge/tag
- `avatar` - User avatar
- `tabs` - Tabbed interface
- `table` - Table (@tanstack/react-table)
- `skeleton` - Loading skeleton
- `alert` - Alert message

**Feedback**:
- `sonner` - Toast notifications

### Базовое использование

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <Button variant="default">Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Inertia.js Integration

### Создание страницы

```tsx
// resources/js/admin/Pages/Products.tsx
import { PageProps } from '@/types/inertia';
import AdminLayout from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/card';

interface ProductsPageProps extends PageProps {
  products: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

export default function Products({ auth, products }: ProductsPageProps) {
  return (
    <AdminLayout user={auth.user}>
      <Card>
        <h1>Products</h1>
        {products.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </Card>
    </AdminLayout>
  );
}
```

### Навигация с Inertia Router

```tsx
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// SPA-style navigation (no page reload)
router.visit(route('sb.admin.users'));

// GET request
router.get(route('sb.admin.users.edit', { id: 1 }));

// POST request
router.post(route('sb.admin.users.update', { id: 1 }), {
  name: 'New Name',
  email: 'email@example.com'
});

// DELETE request
router.delete(route('sb.admin.users.destroy', { id: 1 }));
```

### Inertia Forms

```tsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserEdit({ user }: { user: User }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name || '',
    email: user.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('sb.admin.users.update', { id: user.id }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={e => setData('name', e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      <Button type="submit" disabled={processing}>
        {processing ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
```

## Localization (i18n)

### Translation Files

```
resources/lang/
├── en/
│   ├── admin.php          # Admin UI translations
│   └── filament-*.php     # Filament translations
└── ru/
    ├── admin.php          # Admin UI translations
    └── filament-*.php     # Filament translations
```

### Using Translations

```tsx
import { useLang } from '@/lib/lang';

export default function MyComponent() {
  const { t, lang } = useLang();

  return (
    <div>
      <h1>{t('admin.welcome')}</h1>
      <p>Current locale: {lang}</p>
    </div>
  );
}
```

## Tailwind CSS 4

### Tailwind 4 Syntax Changes

**ВАЖНО**: Tailwind 4 изменил некоторый синтаксис:

```tsx
// ❌ Tailwind 3 (старый)
<div className="bg-gradient-to-r !p-4 bg-[--color] shadow rounded-sm outline-none ring" />

// ✅ Tailwind 4 (новый)
<div className="bg-linear-to-r p-4! bg-(--color) shadow-xs rounded-xs outline-hidden ring-3" />
```

**Изменения**:
- Градиенты: `bg-gradient-to-r` → `bg-linear-to-r`
- !important: `!p-4` → `p-4!` (суффикс)
- CSS vars: `bg-[--color]` → `bg-(--color)` (круглые скобки)
- Тени: `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
- Кольца: `ring` → `ring-3` (ширина)
- Outline: `outline-none` → `outline-hidden`
- Скругления: `rounded-sm` → `rounded-xs`

## Toast Notifications

### Using Sonner

```tsx
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

## Best Practices

### Component Development

- ✅ **Always use shadcn/ui components** - Never build UI primitives from scratch
- ✅ **TypeScript for all components** - Type props, state, and data
- ✅ **Use `cn()` for class merging** - From `@/lib/utils`
- ✅ **Follow Tailwind 4 syntax** - Use `()` for CSS vars, `bg-linear-*` for gradients
- ❌ **No inline styles** - Use Tailwind classes exclusively
- ❌ **No hardcoded colors** - Use theme CSS variables

### State Management

- ✅ **Server state in Inertia props** - Pass data from controllers
- ✅ **Client state in React hooks** - `useState`, `useReducer`
- ✅ **Form handling with Inertia** - Use `useForm()` hook
- ✅ **Use Inertia router for navigation** - No window.location redirects

## Resources

- **shadcn/ui**: https://ui.shadcn.com/
- **Inertia.js**: https://inertiajs.com/
- **Tailwind CSS 4**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **@tanstack/react-table**: https://tanstack.com/table/
- **Sonner**: https://sonner.emilkowal.ski/
- **next-themes**: https://github.com/pacocoursey/next-themes
- **Ziggy**: https://github.com/tighten/ziggy

[← Назад к оглавлению](README.md)