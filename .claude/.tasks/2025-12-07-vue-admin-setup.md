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

- [ ] **Раздел 3: Настройка совместимости с Filament**
  - [ ] 3.1 Сохранить оригинальные маршруты Filament (`/admin/*`)
  - [ ] 3.2 Настроить маршруты Breeze на `/sb/admin/*` (кастомный префикс)
  - [ ] 3.3 Настроить Inertia middleware (не затронуть Filament routes `/admin/*`)
  - [ ] 3.4 Проверить, что Vite config не конфликтует с Filament

- [ ] **Раздел 4: Настройка авторизации**
  - [ ] 4.1 Использовать существующую User модель (не создавать новую!)
  - [ ] 4.2 Интегрировать с Spatie Permission (роли admin/manager)
  - [ ] 4.3 Настроить middleware для доступа к Vue админке
  - [ ] 4.4 Настроить редиректы после логина (admin → Filament, manager → Vue админка)

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

**Статус**: Разделы 1 и 2 завершены ✅. Готов к выполнению Раздела 3.