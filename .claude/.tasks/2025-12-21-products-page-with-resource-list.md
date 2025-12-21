# Создание страницы с продуктами используя ResourceList

Дата создания: 2025-12-21

## Описание
Создать полноценную страницу управления продуктами в Vue админ-панели используя компонент ResourceList (аналогично странице Brands/Index.vue).

## Анализ существующего кода

### Что уже есть:
- ✅ Модель Product с полями: id, brand_id, category_id, title, description, enabled, price, final_price
- ✅ Связи: brand, category, variants, images, orderItems
- ✅ Заглушка страницы `/resources/js/Pages/Admin/Products/Index.vue`
- ✅ Роут для страницы `sb.admin.products.index` в routes/web.php

### Что нужно создать:
- ✅ API контроллер ProductController
- ✅ API роуты для CRUD операций
- ✅ Полноценный компонент Index.vue с ResourceList
- ✅ Диалог создания/редактирования продукта
- ✅ API контроллер CategoryController для загрузки списка категорий

## Структура полей Product

**Основные поля:**
- `id` - BigInt (автоинкремент)
- `brand_id` - BigInt (FK, обязательное)
- `category_id` - BigInt (FK, необязательное)
- `title` - string (обязательное)
- `description` - text (необязательное)
- `enabled` - boolean (статус активности)
- `price` - decimal(10,2) (обязательное)
- `final_price` - decimal(10,2) (обязательное)
- `created_at`, `updated_at` - timestamps

**Вычисляемые атрибуты:**
- `discount` - процент скидки (price - final_price) / price * 100
- `mainImage` - главное изображение (первое по position)
- `externalUrl` - ссылка на продукт в магазине

**Связи для отображения:**
- `brand.name` - название бренда
- `category.name` - название категории
- `variants_count` - количество вариантов
- `images_count` - количество изображений
- `orders_count` - количество заказов

## Чеклист

### 1. Backend - API контроллер

- [x] 1.1. Создать контроллер `App\Http\Controllers\Api\ProductController`
  - [x] 1.1.1. Метод `index()` - список продуктов с пагинацией, фильтрами, сортировкой
  - [x] 1.1.2. Метод `show($id)` - получение продукта по ID
  - [x] 1.1.3. Метод `store()` - создание продукта
  - [x] 1.1.4. Метод `update($id)` - обновление продукта
  - [x] 1.1.5. Метод `destroy($id)` - удаление продукта

- [x] 1.2. Добавить withCount и with для связей
  - [x] Загружать brand, category
  - [x] Считать variants_count, images_count, orders_count (orderItems)

- [x] 1.3. Реализовать фильтрацию
  - [x] Поиск по названию (title)
  - [x] Фильтр по категории (category_id)
  - [x] Фильтр по статусу (enabled)
  - [ ] Фильтр по бренду (brand_id) - опционально для админов (не требуется, есть RLS)

- [x] 1.4. Реализовать сортировку
  - [x] По id, title, price, final_price, created_at
  - [x] По количеству заказов (orders_count)

- [x] 1.5. Валидация данных
  - [x] title: required, string, max:255
  - [x] description: nullable, string
  - [x] category_id: nullable, exists:categories,id
  - [x] price: required, numeric, min:0
  - [x] final_price: required, numeric, min:0
  - [x] enabled: boolean

### 2. Backend - Маршруты

- [x] 2.1. Добавить API роуты в routes/web.php в секцию api
  - [x] GET /sb/admin/api/products (index)
  - [x] GET /sb/admin/api/products/{id} (show)
  - [x] POST /sb/admin/api/products (store)
  - [x] PUT /sb/admin/api/products/{id} (update)
  - [x] DELETE /sb/admin/api/products/{id} (destroy)
  - [x] GET /sb/admin/api/categories (для загрузки списка категорий)

### 3. Frontend - Vue компонент

- [x] 3.1. Обновить `/resources/js/Pages/Admin/Products/Index.vue`
  - [x] Импортировать необходимые компоненты (ResourceList, Dialog, PrimeVue компоненты)
  - [x] Добавить типы TypeScript для Product

- [x] 3.2. Настроить колонки таблицы (columns)
  - [x] ID (sortable, width: 80px)
  - [ ] Изображение (thumbnail главного фото) - в будущем
  - [x] Название (sortable, minWidth: 250px)
  - [x] Категория (sortable, width: 150px)
  - [x] Цена (sortable, width: 120px, formatter: валюта)
  - [x] Финальная цена (sortable, width: 120px, formatter: валюта)
  - [x] Скидка % (width: 100px, formatter: процент или бейдж)
  - [x] Статус (enabled, width: 100px, бейдж)
  - [x] Варианты (variants_count, width: 100px)
  - [x] Изображения (images_count, width: 100px)
  - [x] Заказы (orders_count, sortable, width: 100px)
  - [x] Создан (created_at, sortable, width: 140px, type: date)

- [x] 3.3. Настроить фильтры (filters)
  - [x] Поиск по названию (text input)
  - [x] Фильтр по категории (dropdown, загрузка списка категорий)
  - [x] Фильтр по статусу (dropdown: Все / Активные / Неактивные)

- [x] 3.4. Настроить действия (actions)
  - [x] Редактирование (edit)
  - [x] Удаление (delete, disabled если есть заказы)
  - [ ] Возможно: переход на страницу детализации - в будущем

- [x] 3.5. Создать функцию fetchProducts
  - [x] Формирование query params (page, per_page, sort, filters)
  - [x] Fetch запрос к /sb/admin/api/products
  - [x] Обработка ошибок

### 4. Диалог создания/редактирования

- [x] 4.1. Создать Dialog компонент
  - [x] Режимы: create / edit
  - [x] Состояние: dialogVisible, dialogMode, dialogLoading

- [x] 4.2. Поля формы
  - [x] Название (InputText, required)
  - [x] Описание (Textarea)
  - [x] Категория (Select, загрузка списка)
  - [x] Цена (InputNumber, required, min: 0)
  - [x] Финальная цена (InputNumber, required, min: 0)
  - [x] Статус (ToggleSwitch для enabled)

- [x] 4.3. Обработчики событий
  - [x] handleCreate() - открытие диалога создания
  - [x] handleEdit(product) - открытие диалога редактирования
  - [x] handleSubmit() - отправка формы (POST/PUT)
  - [x] handleDelete(product) - удаление продукта
  - [x] handleDialogHide() - сброс формы

- [x] 4.4. Валидация и ошибки
  - [x] Отображение ошибок валидации от сервера
  - [x] Toast уведомления (успех/ошибка)

### 5. Дополнительные улучшения (после MVP)

- [ ] 5.1. Отображение thumbnail главного изображения в таблице
- [ ] 5.2. Быстрое переключение статуса enabled прямо из таблицы
- [ ] 5.3. Bulk операции (массовое удаление, изменение статуса)
- [ ] 5.4. Экспорт в CSV/Excel
- [ ] 5.5. Загрузка изображений в диалоге создания/редактирования
- [ ] 5.6. Управление вариантами (variants) на отдельной странице или в диалоге

### 6. Тестирование

- [ ] 6.1. Проверить список продуктов (пагинация, сортировка)
- [ ] 6.2. Проверить фильтры (поиск, категория, статус)
- [ ] 6.3. Проверить создание нового продукта
- [ ] 6.4. Проверить редактирование продукта
- [ ] 6.5. Проверить удаление продукта
- [ ] 6.6. Проверить валидацию (обязательные поля, минимальные значения)
- [ ] 6.7. Проверить Row Level Security (менеджер видит только свои продукты)
- [ ] 6.8. Проверить автоматическое присвоение brand_id при создании

## Технические детали

### Пример структуры ответа API (index)

```json
{
  "data": [
    {
      "id": 1,
      "brand_id": 1,
      "category_id": 3,
      "title": "Product Name",
      "description": "Product description...",
      "enabled": true,
      "price": "99.99",
      "final_price": "79.99",
      "discount": 20,
      "created_at": "2025-12-21T10:00:00.000000Z",
      "updated_at": "2025-12-21T10:00:00.000000Z",
      "brand": {
        "id": 1,
        "name": "Brand Name"
      },
      "category": {
        "id": 3,
        "name": "Category Name"
      },
      "variants_count": 5,
      "images_count": 3,
      "orders_count": 12,
      "main_image": {
        "id": 1,
        "image_id": 10,
        "position": 1
      }
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 95
}
```

### Row Level Security для менеджеров

В контроллере применять фильтр по brand_id:

```php
if (!Auth::user()->hasRole('admin')) {
    $query->where('brand_id', Auth::user()->brands()->first()->id);
}
```

## Примечания

- Использовать PrimeVue компоненты максимально (Dialog, InputText, InputNumber, Dropdown, ToggleSwitch, Toast)
- Tailwind CSS 4 для стилизации
- TypeScript для типизации
- Следовать паттерну из Brands/Index.vue
- Decimal поля (price, final_price) конвертировать в строки в JSON
- BigInt ID - использовать serializeObject при необходимости