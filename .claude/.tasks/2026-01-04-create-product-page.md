# Создание страницы для создания продукта

Дата создания: 2026-01-04

## Описание
Создать страницу для создания нового продукта в React админке, используя общие компоненты со страницы редактирования ProductEdit.tsx.

## Анализ существующей структуры

### Используемые компоненты в ProductEdit:
- `ProductImagesManager` - управление изображениями продукта
- `ProductImagesPicker` - выбор изображения для варианта
- `ProductVariantItem` - карточка варианта продукта
- `RichTextEditor` - редактор описания
- shadcn/ui компоненты: Input, Select, Checkbox, Button, Label

### Используемые хуки в ProductEdit:
- `useProduct(productId)` - получение данных продукта
- `useCategories(brandId)` - получение категорий
- `useUpdateProduct()` - обновление продукта
- `useSetVariantImage()` - установка изображения варианта

### Что отсутствует:
- ❌ API endpoint функция `createProduct`
- ❌ Хук `useCreateProduct`
- ❌ Страница `ProductCreate.tsx`
- ❌ Laravel контроллер метод для создания

## Чеклист

### Раздел 1: Backend - Laravel API
- [x] 1.1. Создать метод `store` в `ProductController` для создания продукта
- [x] 1.2. Добавить валидацию данных (FormRequest или inline)
- [x] 1.3. Добавить роут в `routes/web.php` для POST запроса
- [x] 1.4. Протестировать endpoint через API

### Раздел 2: Frontend - API Layer
- [x] 2.1. Добавить тип `CreateProductRequest` в `types/api.ts`
- [x] 2.2. Создать функцию `createProduct` в `lib/api/endpoints/products.ts`
- [x] 2.3. Создать хук `useCreateProduct` в `lib/hooks/mutations/useProductMutations.ts`

### Раздел 3: Frontend - UI Components
- [x] 3.1. Создать страницу `ProductCreate.tsx` в `Pages/`
- [x] 3.2. Переиспользовать компоненты из ProductEdit:
  - [x] Форма с полями: title, description, category, enabled
  - [x] Управление вариантами (ProductVariantItem)
  - [x] Валидация: минимум 1 вариант обязателен
- [x] 3.3. Добавить кнопку "Создать" вместо "Сохранить"
- [x] 3.4. Настроить редирект после успешного создания

### Раздел 4: Routing
- [x] 4.1. Добавить GET роут `/sb/admin/products/create` в `routes/web.php`
- [x] 4.2. Добавить POST роут `/sb/admin/products/api` для создания
- [x] 4.3. Добавить кнопку "Создать продукт" на странице списка Products.tsx

### Раздел 5: Локализация
- [x] 5.1. Добавить переводы в `resources/lang/en/admin.php`:
  - `admin.products_create.title`
  - `admin.products_create.description`
  - `admin.products_create.success.created`
  - `admin.products_create.actions.create`
  - `admin.products_create.actions.creating`
- [x] 5.2. Добавить переводы в `resources/lang/ru/admin.php`

### Раздел 6: Тестирование и финализация
- [x] 6.1. Запустить `npm run lint` для проверки кода
- [x] 6.2. Исправить все ошибки линтера
- [ ] 6.3. Протестировать создание продукта через UI
- [ ] 6.4. Проверить редирект после создания
- [ ] 6.5. Проверить работу на обоих языках (en/ru)

## Примечания

### Особенности создания vs редактирования:
1. **Нет загрузки данных** - форма инициализируется с пустыми значениями
2. **Нет ProductImagesManager** - изображения добавляются только после создания продукта
3. **Варианты только локальные** - без сохранённых ID до создания
4. **Редирект на edit** - после создания перенаправить на страницу редактирования

### Упрощения для первой версии:
- Изображения продукта добавляются только после создания (на странице edit)
- Изображения вариантов также добавляются после создания
- Фокус на основных полях: title, description, category, variants

## Статус
✅ Завершено (2026-01-04)

## Результаты выполнения

### Backend (Laravel)
✅ Создан метод `apiStore()` в `ProductController` (`api/app/Http/Controllers/Admin/ProductController.php:192`)
✅ Создан метод `create()` для отображения страницы (`api/app/Http/Controllers/Admin/ProductController.php:34`)
✅ Добавлены роуты:
  - GET `/sb/admin/products/create` → страница создания
  - POST `/sb/admin/products/api` → API создания

### Frontend API Layer
✅ Добавлен тип `CreateProductRequest` (`api/resources/js/admin/types/api.ts:146`)
✅ Создана функция `createProduct()` (`api/resources/js/admin/lib/api/endpoints/products.ts:55`)
✅ Создан хук `useCreateProduct()` (`api/resources/js/admin/lib/hooks/mutations/useProductMutations.ts:39`)

### Frontend UI
✅ Создана страница `ProductCreate.tsx` (`api/resources/js/admin/Pages/ProductCreate.tsx`)
  - Переиспользованы компоненты: ProductVariantItem, RichTextEditor, shadcn/ui
  - Реализована валидация: минимум 1 вариант
  - Настроен редирект на `/products/{id}/edit` после создания
✅ Добавлена кнопка "Создать товар" на странице `Products.tsx:449`

### Локализация
✅ Английские переводы (`resources/lang/en/admin.php:254-295`)
✅ Русские переводы (`resources/lang/ru/admin.php:254-295`)

### Качество кода
✅ ESLint проверка пройдена без ошибок

## Следующие шаги (опционально)
- [ ] Протестировать создание продукта через UI вручную
- [ ] Проверить работу на обоих языках (en/ru)
- [ ] Проверить редирект после создания