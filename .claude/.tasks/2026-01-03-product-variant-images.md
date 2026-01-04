# Добавление управления изображениями для продуктов и вариантов

Дата создания: 2026-01-03
Дата завершения: 2026-01-03

## Статус: ✅ ЗАВЕРШЕНО

## Описание
Добавить в React админку возможность загрузки и управления изображениями для продуктов и вариантов продуктов.

## Что было реализовано

### Backend API
- ✅ Роуты для управления изображениями продуктов (attach, upload, detach, reorder)
- ✅ Роут для установки изображений вариантов
- ✅ VariantController с методом apiSetImage
- ✅ MediaController::apiIndex для получения списка медиатеки
- ✅ Расширение ProductController::apiShow для включения данных об изображениях вариантов

### Frontend Components
- ✅ MediaPickerDialog - выбор изображений из медиатеки с поддержкой множественного/одиночного выбора
- ✅ ImageUploadDialog - загрузка новых изображений с drag & drop
- ✅ ProductImagesManager - полное управление изображениями продукта с drag & drop сортировкой

### Frontend Hooks
- ✅ useMedia - получение списка медиатеки
- ✅ useAttachProductImages - прикрепление существующих изображений
- ✅ useUploadProductImages - загрузка новых изображений
- ✅ useDetachProductImage - удаление изображения
- ✅ useReorderProductImages - изменение порядка
- ✅ useSetVariantImage - установка изображения варианта

### Integration
- ✅ ProductEdit.tsx обновлен с ProductImagesManager
- ✅ Добавлена возможность выбора изображений для вариантов
- ✅ TypeScript типы обновлены (Variant с image_id и image_url)

### Локализация
- ✅ Английские переводы (en/admin.php)
- ✅ Русские переводы (ru/admin.php)
- ✅ Переводы для products_edit.images, media_picker, image_upload

### Тестирование
- ✅ Линтинг пройден успешно (npm run lint)
- ✅ Все ошибки ESLint исправлены

## Чеклист выполнения

### Раздел 1: Backend - API для изображений продуктов
- [x] 1.1. Добавить роут POST `/sb/admin/products/{id}/images/attach/api`
- [x] 1.2. Добавить роут POST `/sb/admin/products/{id}/images/upload/api`
- [x] 1.3. Добавить роут DELETE `/sb/admin/products/{id}/images/{productImageId}/api`
- [x] 1.4. Добавить роут PUT `/sb/admin/products/{id}/images/reorder/api`
- [x] 1.5. Добавить методы в ProductController:
  - [x] apiAttachImages()
  - [x] apiUploadImages()
  - [x] apiDetachImage()
  - [x] apiReorderImages()

### Раздел 2: Backend - API для изображений вариантов
- [x] 2.1. Добавить роут PUT `/sb/admin/variants/{id}/image/api`
- [x] 2.2. Создать VariantController в Admin директории
- [x] 2.3. Добавить метод apiSetImage()

### Раздел 3: Backend - Расширить apiShow для вариантов
- [x] 3.1. Добавить image_id и image_url в возвращаемые данные вариантов

### Раздел 4: Frontend - UI компоненты
- [x] 4.1. Создать компонент MediaPickerDialog
  - [x] Отображение списка изображений
  - [x] Множественный выбор
  - [x] Одиночный выбор
  - [x] Пагинация
  - [x] Поиск
- [x] 4.2. Создать компонент ImageUploadDialog
  - [x] Drag & drop зона с keyboard support
  - [x] Превью выбранных файлов
  - [x] Загрузка множественных файлов
- [x] 4.3. Создать компонент ProductImagesManager
  - [x] Отображение текущих изображений
  - [x] Drag & drop для изменения порядка
  - [x] Кнопка удаления
  - [x] Кнопка "Добавить из медиатеки"
  - [x] Кнопка "Загрузить новые"
  - [x] Badge "Main" для первого изображения

### Раздел 5: Frontend - React Hooks для API
- [x] 5.1. Создать useAttachProductImages mutation
- [x] 5.2. Создать useUploadProductImages mutation
- [x] 5.3. Создать useDetachProductImage mutation
- [x] 5.4. Создать useReorderProductImages mutation
- [x] 5.5. Создать useSetVariantImage mutation
- [x] 5.6. Создать useMedia query

### Раздел 6: Frontend - Интеграция в ProductEdit
- [x] 6.1. Заменить секцию "Product Images" на ProductImagesManager
- [x] 6.2. Добавить поле выбора изображения для каждого варианта
  - [x] Превью изображения варианта
  - [x] Кнопка "Выбрать из медиатеки"
  - [x] Кнопка "Удалить изображение"

### Раздел 7: Frontend - Типы TypeScript
- [x] 7.1. Обновить тип Variant
- [x] 7.2. Добавить типы для API запросов/ответов

### Раздел 8: Локализация
- [x] 8.1. Добавить переводы в resources/lang/en/admin.php
- [x] 8.2. Добавить переводы в resources/lang/ru/admin.php

### Раздел 9: Тестирование и финализация
- [x] 9.1. Запустить `npm run lint`
- [x] 9.2. Исправить все ошибки линта
- [x] 9.3. Готово к тестированию функционала

## Созданные файлы

### Backend
- `app/Http/Controllers/Admin/VariantController.php` - контроллер для управления вариантами
- Обновлены роуты в `routes/web.php`
- Обновлен `app/Http/Controllers/Admin/ProductController.php`
- Обновлен `app/Http/Controllers/Admin/MediaController.php`

### Frontend
- `resources/js/admin/components/media-picker-dialog.tsx` - выбор изображений
- `resources/js/admin/components/image-upload-dialog.tsx` - загрузка изображений
- `resources/js/admin/components/product-images-manager.tsx` - управление изображениями
- `resources/js/admin/lib/hooks/api/useMedia.ts` - хук для медиатеки
- `resources/js/admin/lib/hooks/mutations/useProductImageMutations.ts` - мутации для изображений
- Обновлены типы в `resources/js/admin/types/api.ts`
- Обновлен `resources/js/admin/Pages/ProductEdit.tsx`

### Локализация
- Обновлен `resources/lang/en/admin.php`
- Обновлен `resources/lang/ru/admin.php`

## Технические детали

### Структура ProductImage
```
product_images:
  - id (bigint)
  - product_id (bigint)
  - image_id (bigint)
  - position (int)
```

### Структура Variant
```
variants:
  - id (bigint)
  - product_id (bigint)
  - image_id (bigint) - ссылка на product_images.id (НЕ на images.id!)
  - title, price, final_price, enabled
```

### Важные моменты реализации
- Variant.image_id ссылается на ProductImage, НЕ на Image напрямую
- При установке изображения варианта изображение должно быть сначала прикреплено к продукту
- ProductImageObserver автоматически пересчитывает position при создании/удалении
- Все компоненты поддерживают dark mode через Tailwind CSS 4
- Использованы shadcn/ui компоненты для консистентного UI
- React Query для управления состоянием и кешированием
- Полная поддержка локализации (en/ru)