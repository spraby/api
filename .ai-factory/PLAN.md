# Implementation Plan: Variant Image Picker (3 sources)

Branch: main
Created: 2026-02-23

## Settings
- Testing: no
- Logging: standard

## Context

**Цель:** Добавить возможность выбора изображения для вариантов из 3 источников:
1. Картинки продукта (существующие product_images)
2. Медиа библиотека (images таблица)
3. Загрузка новой картинки

**Текущее состояние:**
- `Variant.image_id` → `product_images.id` (в БД уже есть)
- `VariantImagePickerDialog` существует, но показывает ТОЛЬКО картинки продукта
- `VariantRow` (используется в таблице вариантов) — НЕТ никакой работы с картинками
- `ProductVariantItem` — компонент с пикером картинок, но он НЕ используется в текущем флоу
- `VariantController.apiSetImage` — endpoint для установки image, принимает только product_image_id

**Технический подход:**
- Новый backend API endpoint `POST /admin/products/{product}/images/api-attach` — принимает `image_id` (существующий images.id), возвращает JSON с product_image_id + URL
- Для загрузки нового файла: сначала загрузить в `admin.media.api.store` (получить image_id), затем вызвать `api-attach`
- `VariantImagePickerDialog` расширяется 3 вкладками (Tabs): product images / media / upload
- В `ProductForm` поддерживается локальный стейт `localPickableImages`, обновляемый при привязке новых картинок к продукту через `onNewImageAttached` callback
- Для отображения URL в `VariantRow`: `pickableImages.find(img => img.id === variant.image_id)?.url ?? variant.image_url`
- Create mode: только вкладка "Картинки продукта" с staged localImages (нет productId → нет API calls)

## Commit Plan
- **Commit 1** (после задач 1-2): `feat: add JSON api endpoint for attaching image to product`
- **Commit 2** (после задач 3-5): `feat: add image thumbnail and picker to variant row`
- **Commit 3** (после задач 6-8): `feat: extend variant image picker with media and upload tabs`

## Tasks

### Phase 1: Backend
- [x] Task 1: Новый метод `apiAttachImage` в ProductController
- [x] Task 2: Добавить маршрут `POST /admin/products/{product}/images/api-attach`

### Phase 2: Frontend — Типы и стейт
- [x] Task 3: Добавить `image_url` в `LocalVariant` + обновить `useProductForm`
- [x] Task 4: Обновить `ProductForm` — стейт `localPickableImages` + `onNewImageAttached`
<!-- 🔄 Commit checkpoint: tasks 1-4 -->

### Phase 3: Frontend — UI компоненты
- [x] Task 5: Обновить `ProductVariantsCard` — добавить пропсы и пробросить в `VariantRow`
- [x] Task 6: Обновить `VariantRow` — thumbnail + открытие диалога
- [ ] Task 7: Расширить `VariantImagePickerDialog` — 3 вкладки (product / media / upload)
<!-- 🔄 Commit checkpoint: tasks 5-7 -->

### Phase 4: Локализация
- [ ] Task 8: Добавить переводы (en + ru)
<!-- 🔄 Commit checkpoint: task 8 -->
