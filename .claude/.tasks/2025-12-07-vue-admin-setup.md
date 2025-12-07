# Задача: Создание Vue админки для Laravel 12

Дата создания: 2025-12-07

## Описание

Необходимо добавить Vue.js админку к существующему Laravel 12 проекту, который уже использует Filament для административной панели. Vue админка должна работать параллельно с Filament без конфликтов.

## Требования

- Использовать **стандартные инструменты Laravel** для админки на Vue
- Использовать совместимо с текущим стеком (Filament 4.0, Laravel 12, PostgreSQL 15)
- Работа в Laravel Cloud (deployment compatibility)
- Filament админка должна работать как раньше - НЕ РАЗРУШАТЬ ЕЕ!

## Чеклист

- [x] **Раздел 1: Подготовка** (Preparation) ✅
  - [x] 1.1 Проверить текущий composer.json и package.json
  - [x] 1.2 Проверить текущую конфигурацию Vite
  - [x] 1.3 Определить, что уже установлено из Vue/Inertia стека

- [x] **Раздел 2: Установка Laravel Breeze с Inertia + Vue** ✅
  - [x] 2.1 Установить Laravel Breeze: `composer require laravel/breeze --dev`
  - [x] 2.2 Установить Vue стек: `php artisan breeze:install vue`
  - [x] 2.3 Настроить кастомные маршруты (не перезаписывать существующие)
  - [x] 2.4 Установить npm зависимости: `npm install`
  - [x] 2.5 Скомпилировать assets: `npm run build`

- [x] **Раздел 3: Настройка совместимости с Filament** ✅
  - [x] 3.1 Сохранить оригинальные маршруты Filament (`/admin/*`)
  - [x] 3.2 Настроить маршруты Breeze на `/sb/admin/*` (кастомный префикс)
  - [x] 3.3 Настроить Inertia middleware (не затронуть Filament routes `/admin/*`)
  - [x] 3.4 Настроить TailwindCSS v4 через PostCSS и Vite plugin
  - [x] 3.5 Обновить все Vue компоненты с префиксом `sb.admin.*` в route()
  - [x] 3.6 Обновить все Auth контроллеры с правильными именами маршрутов
  - [x] 3.7 Настроить redirectGuestsTo для правильного редиректа

- [x] **Раздел 4: Настройка авторизации** ✅
  - [x] 4.1 Использовать существующую User модель (не создавать новую!)
  - [x] 4.2 Подтвердить работу с Spatie Permission (все роли имеют доступ к обеим админкам)
  - [x] 4.3 Проверить middleware авторизации для Vue админки
  - [x] 4.4 Убедиться, что обе админки (Filament и Vue) равноценны и доступны всем ролям

- [ ] **Раздел 5: Создание базовой админки на Vue**
  - [ ] 5.1 Создать Dashboard компонент
  - [ ] 5.2 Добавить навигацию (Products, Orders, etc.)
  - [ ] 5.3 Создать CRUD компоненты для основных моделей
  - [ ] 5.4 Интегрировать с существующими Eloquent моделями

- [ ] **Раздел 6: Тестирование**
  - [ ] 6.1 Проверить работу Filament админки (не должна быть затронута)
  - [ ] 6.2 Проверить работу Vue админки
  - [ ] 6.3 Проверить авторизацию в обеих админках
  - [ ] 6.4 Проверить сборку для production (npm run build)
  - [ ] 6.5 Проверить работу в Docker контейнере
  - [ ] 6.6 Проверить совместимость с Laravel Cloud

- [ ] **Раздел 7: Документация**
  - [ ] 7.1 Обновить CLAUDE.md с инструкциями по Vue админке
  - [ ] 7.2 Документировать маршруты и endpoints
  - [ ] 7.3 Добавить примеры использования

## Результаты исследования (Раздел 1)

### Текущее состояние проекта:

**Composer (PHP зависимости):**
- ✅ Laravel 12.x установлен
- ✅ Filament 4.0 установлен
- ✅ Spatie Laravel Permission установлен
- ❌ Laravel Breeze НЕ установлен
- ❌ Inertia.js НЕ установлен

**NPM (JS зависимости):**
- ✅ Vite 6.0.11 установлен
- ✅ TailwindCSS 4.0 установлен
- ✅ Laravel Vite Plugin установлен
- ❌ Vue.js НЕ установлен
- ❌ @inertiajs/vue3 НЕ установлен
- ❌ Любые Vue-related пакеты НЕ установлены

**Vite конфигурация:**
- Entry points: `resources/css/app.css`, `resources/js/app.js`
- TailwindCSS plugin активен
- Конфигурация базовая, готова для расширения

**Структура проекта:**
- `resources/js/` - только базовые JS файлы (bootstrap.js, app.js, custom.js)
- `resources/views/` - только Blade шаблоны (для Filament)
- НЕТ Vue компонентов
- НЕТ Inertia Pages

### Выводы:

1. **Чистая установка** - нет конфликтующих Vue/Inertia пакетов
2. **Vite готов** - можно расширить для поддержки Vue
3. **TailwindCSS уже есть** - будет использоваться и для Vue админки
4. **Можно безопасно устанавливать Breeze** - не будет конфликтов

## Технические решения

### Решение: Laravel Breeze + Inertia.js + Vue 3

**Laravel Breeze** - официальный стартовый набор Laravel для аутентификации с поддержкой:
- Vue 3 + Composition API
- Inertia.js для SSR-like опыта
- Tailwind CSS для стилизации (уже установлен!)
- Vite для сборки assets (уже настроен!)

**Что нужно установить:**
1. `laravel/breeze` - Composer пакет
2. `vue` + `@vitejs/plugin-vue` - Vue 3 + Vite plugin
3. `@inertiajs/vue3` - Inertia.js клиент для Vue
4. `ziggy-js` - для использования Laravel routes в Vue

### Архитектура маршрутов:

- `/admin/*` - Filament (существующий, не трогать!)
- `/sb/admin/*` - Vue админка (новый)
  - `/sb/admin` - Dashboard
  - `/sb/admin/login` - Login page
  - `/sb/admin/products` - Products management
  - `/sb/admin/orders` - Orders management
  - и т.д.

### Система авторизации:

- Использовать существующую User модель
- Использовать Spatie Permission для ролей
- Общая сессия Laravel для обеих админок
- **ВАЖНО**: Обе админки (Filament и Vue) равноценны и доступны всем ролям (admin, manager)
- Нет разделения по ролям между админками - пользователь может использовать любую

## Примечания

- Docker setup должен поддерживать Vue компиляцию
- Vite уже настроен в проекте (используется для Filament)
- PostgreSQL 15 на порту 5435
- Поддержка локализации (en, ru)

---

## Результаты выполнения (Раздел 2)

### Что было установлено:

**Composer пакеты:**
- ✅ `laravel/breeze` v2.3.8
- ✅ `inertiajs/inertia-laravel` v2.0.11
- ✅ `laravel/sanctum` v4.2.1
- ✅ `tightenco/ziggy` v2.6.0

**NPM пакеты:**
- ✅ `vue` ^3.4.0
- ✅ `@vitejs/plugin-vue` ^5.0.0
- ✅ `@inertiajs/vue3` ^2.0.0
- ✅ `@tailwindcss/forms` ^0.5.3

### Созданные файлы и структура:

**Vue компоненты** (29 файлов):
- `resources/js/Pages/` - Dashboard, Welcome, Auth (Login, Register, etc.), Profile
- `resources/js/Layouts/` - AuthenticatedLayout, GuestLayout
- `resources/js/Components/` - Buttons, Inputs, Modals, Navigation, etc.

**Контроллеры**:
- `app/Http/Controllers/ProfileController.php`
- `app/Http/Controllers/Auth/*` (8 контроллеров для аутентификации)

**Middleware**:
- `app/Http/Middleware/HandleInertiaRequests.php`

### Настройки:

**Маршруты** (`routes/web.php`):
- ✅ Восстановлен оригинальный маршрут `/set-locale/{locale}`
- ✅ Все Vue админка маршруты под префиксом `/sb/admin`
- ✅ Filament маршруты `/admin` не затронуты

**Middleware** (`bootstrap/app.php`):
- ✅ Inertia middleware НЕ применяется глобально
- ✅ Создан alias 'inertia' для HandleInertiaRequests
- ✅ Применяется только к группе `/sb/admin`

**Vite конфигурация** (`vite.config.js`):
- ✅ Добавлен Vue plugin
- ✅ Восстановлен TailwindCSS plugin
- ✅ Entry points: CSS + JS

**Компиляция**:
- ✅ Assets скомпилированы успешно
- ✅ Создан `public/build/manifest.json`
- ✅ 21 chunk файлов, общий размер ~250KB

---

## Результаты выполнения (Раздел 3) - Настройка стилей TailwindCSS v4

### Проблема:
После установки Laravel Breeze страницы Vue не были стилизованы, хотя имели классы TailwindCSS.

### Причина:
1. В проекте использовалось **две версии TailwindCSS одновременно**:
   - `tailwindcss` v3.2.1 (через PostCSS)
   - `@tailwindcss/vite` v4.0.0 (через Vite plugin)
2. TailwindCSS v4 работает по-другому и требует специальной настройки

### Решение:

#### 1. Обновили TailwindCSS до v4:
```bash
npm install -D tailwindcss@next
npm install -D @tailwindcss/postcss
```

#### 2. Настроили PostCSS конфигурацию (`postcss.config.js`):
```javascript
export default {
    plugins: {
        '@tailwindcss/postcss': {},  // TailwindCSS v4 через PostCSS
        autoprefixer: {},
    },
};
```

#### 3. Обновили CSS файл (`resources/css/app.css`):
```css
@import "tailwindcss";
```

#### 4. Настроили Vite (`vite.config.js`):
```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        tailwindcss(),  // TailwindCSS v4 Vite plugin
    ],
});
```

#### 5. Обновили Inertia layout (`resources/views/app.blade.php`):
```blade
@vite(['resources/css/app.css', 'resources/js/app.js', "resources/js/Pages/{$page['component']}.vue"])
```
**Важно:** CSS файл должен быть первым в массиве!

#### 6. Скомпилировали assets:
```bash
npm run build
```

### Как работают стили сейчас:

**TailwindCSS v4 через два канала:**
1. **@tailwindcss/vite** - Vite plugin для сканирования файлов и генерации утилит
2. **@tailwindcss/postcss** - PostCSS plugin для обработки CSS

**Автоматическое сканирование:**
- TailwindCSS v4 автоматически сканирует все файлы в проекте
- Находит классы в `.vue`, `.blade.php`, `.js` файлах
- Генерирует только используемые CSS утилиты

**Разделение стилей:**
- **Vue админка** (`/sb/admin/*`): использует TailwindCSS v4 через `resources/css/app.css`
- **Filament** (`/admin/*`): использует собственные стили из `vendor/filament`
- Стили НЕ конфликтуют, так как используют разные entry points

### Результат:
- ✅ CSS файл: 43.24 kB (сжатый: 8.22 kB)
- ✅ Все страницы Vue полностью стилизованы
- ✅ Filament не затронут
- ✅ Hot reload работает через `npm run dev`

---

## Результаты выполнения (Раздел 4) - Настройка авторизации

### 4.1: Проверка существующей User модели

**Модель готова к использованию:**
- ✅ Использует `HasRoles` trait от Spatie Permission
- ✅ Определены методы `isAdmin()` и `isManager()`
- ✅ Константы ролей: `ADMIN = 'admin'`, `MANAGER = 'manager'`
- ✅ Определены массивы пермишенов для каждой роли
- ✅ Связь с Brand через `brands()` relation
- ✅ Laravel Breeze автоматически использует эту модель для аутентификации

**Роли в системе:**
- `admin` - полный доступ ко всем ресурсам
- `manager` - ограниченный доступ (только чтение для некоторых ресурсов)
- `customer` - для клиентов (не используется в админках)

### 4.2: Интеграция с Spatie Permission

**Обновлен HandleInertiaRequests middleware** (`app/Http/Middleware/HandleInertiaRequests.php:30`):

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'first_name' => $request->user()->first_name,
                'last_name' => $request->user()->last_name,
                'email' => $request->user()->email,
                'roles' => $request->user()->getRoleNames(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                'is_admin' => $request->user()->isAdmin(),
                'is_manager' => $request->user()->isManager(),
            ] : null,
        ],
    ];
}
```

**Что передается во Vue компоненты:**
- Все базовые данные пользователя (id, имя, email)
- Массив ролей через `getRoleNames()`
- Массив пермишенов через `getAllPermissions()->pluck('name')`
- Булевые флаги `is_admin` и `is_manager` для удобства

### 4.3: Проверка middleware авторизации

**Middleware настроен корректно** (`bootstrap/app.php:13-27`):

1. **Inertia middleware** применяется только к `/sb/admin` маршрутам через alias:
   ```php
   $middleware->alias([
       'inertia' => \App\Http\Middleware\HandleInertiaRequests::class,
   ]);
   ```

2. **Редирект неавторизованных пользователей** работает по-разному для разных маршрутов:
   ```php
   $middleware->redirectGuestsTo(function ($request) {
       if ($request->is('sb/admin/*') || $request->is('sb/admin')) {
           return route('sb.admin.login');
       }
       return '/admin/login'; // For Filament
   });
   ```

3. **Защита маршрутов** через стандартный middleware Laravel:
   - Dashboard: `['auth', 'verified']` - требует аутентификации и верификации email
   - Profile: `['auth']` - требует только аутентификации
   - Auth routes: `['guest']` - доступны только неавторизованным

### 4.4: Подтверждение равноценности админок

**Обе админки доступны всем ролям:**
- ✅ Filament (`/admin/*`) - доступен для admin и manager
- ✅ Vue (`/sb/admin/*`) - доступен для admin и manager
- ✅ Нет разделения по ролям между админками
- ✅ Пользователь может использовать любую админку по своему выбору

**Обновлен Dashboard** (`resources/js/Pages/Dashboard.vue:1`) для демонстрации:
- Показывает email пользователя
- Показывает роли пользователя
- Показывает флаги is_admin и is_manager
- Содержит ссылки на обе админки (/admin и /sb/admin/dashboard)
- Поясняет, что обе админки доступны всем ролям

### Тестовые данные:

**Доступные пользователи для тестирования:**
- `admin@gmail.com` - роль: admin
- `manager1@gmail.com` - роль: manager
- `manager2@gmail.com` до `manager16@gmail.com` - роль: manager

**Маршруты для тестирования:**
- `/sb/admin/login` - Логин Vue админки
- `/sb/admin/dashboard` - Dashboard Vue админки
- `/admin` - Filament админка

### Результат:
- ✅ User модель полностью совместима с Vue админкой
- ✅ Spatie Permission интегрирован через Inertia middleware
- ✅ Роли и пермишены передаются во Vue компоненты
- ✅ Middleware авторизации настроен корректно
- ✅ Обе админки равноценны и доступны всем ролям
- ✅ Dashboard демонстрирует работу авторизации

---

**Статус**: Разделы 1, 2, 3 и 4 завершены ✅. Готов к выполнению Раздела 5.