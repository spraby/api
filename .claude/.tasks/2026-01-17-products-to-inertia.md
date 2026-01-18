# Преобразование Products на Inertia

Дата создания: 2026-01-17

## Описание
Преобразовать страницу Products.tsx с API (TanStack Query) на Inertia. Отказаться от использования API endpoints и использовать Inertia props и router.

## Чеклист

- [x] Раздел 1: Backend - Обновить ProductController
  - [x] Обновить метод `index()` - передавать products в Inertia props
  - [x] Добавить метод `destroy()` для удаления одного продукта (Inertia)
  - [x] Добавить метод `bulkDestroy()` для массового удаления (Inertia)
  - [x] Добавить метод `bulkUpdateStatus()` для массового обновления статуса (Inertia)

- [x] Раздел 2: Backend - Обновить routes/web.php
  - [x] Обновить GET route для `/sb/admin/products` → `index` (был inline function)
  - [x] Добавить DELETE route для удаления продукта (`products.destroy`)
  - [x] Добавить POST route для массового удаления (`products.bulk-delete`)
  - [x] Добавить POST route для массового обновления статуса (`products.bulk-update-status`)

- [x] Раздел 3: Frontend - Переписать Products.tsx
  - [x] Убрать импорты TanStack Query хуков (`useProducts`, `useDeleteProduct`, etc.)
  - [x] Получать products из `usePage().props`
  - [x] Заменить API мутации на `router.delete()` и `router.post()`
  - [x] Убрать состояния загрузки/ошибки (Inertia управляет)
  - [x] Добавить toast уведомления для операций

- [x] Раздел 4: Переводы
  - [x] Добавить EN переводы для success/errors сообщений
  - [x] Добавить RU переводы для success/errors сообщений

- [x] Раздел 5: Проверка
  - [x] Запустить линтер `npm run lint`

## Изменённые файлы

1. `app/Http/Controllers/Admin/ProductController.php`
   - Обновлён `index()` - теперь передаёт products в Inertia props
   - Добавлен `destroy()` для удаления продукта
   - Добавлен `bulkDestroy()` для массового удаления
   - Добавлен `bulkUpdateStatus()` для массового обновления статуса

2. `routes/web.php`
   - Обновлён route `/sb/admin/products` на контроллер
   - Добавлены routes: `products.destroy`, `products.bulk-delete`, `products.bulk-update-status`

3. `resources/js/admin/Pages/Products.tsx`
   - Полностью переписан на Inertia (убран TanStack Query)
   - Данные получаются из `usePage().props`
   - Операции через `router.delete()` и `router.post()`

4. `resources/lang/en/admin.php` - добавлены переводы success/errors
5. `resources/lang/ru/admin.php` - добавлены переводы success/errors

## Примечание

API endpoints (deprecated) оставлены для обратной совместимости:
- `products.api.index`
- `products.api.destroy`
- `products.api.bulk-delete`
- `products.api.bulk-update-status`