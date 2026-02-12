# Implementation Plan: Рефакторинг страницы продукта

Branch: main
Created: 2026-02-11

## Settings
- Testing: no
- Logging: minimal (dev-only debug logs where specified)

## Аудит

Обнаружены проблемы:
- **CRITICAL**: Варианты по индексу массива, двойная система ID (id + _tempId), путаница Image vs ProductImage ID
- **HIGH**: Нет обработки ошибок, ProductForm 416 строк, глубокий prop drilling
- **MEDIUM**: Дублирование валидации, хрупкое определение unsaved changes

## Commit Plan
- **Commit 1** (after tasks 3-4): "refactor: introduce stable UIDs for variants and clarify image IDs"
- **Commit 2** (after tasks 5-7): "refactor: add error handling, split ProductForm, improve type safety"
- **Commit 3** (after tasks 8-10): "refactor: replace prop drilling with store, add optimistic updates, fix unsaved detection"

## Tasks

### Phase 1: Foundation (ID System)
- [x] Task 3: Ввести стабильные UID для вариантов (заменить index-based идентификацию)
  - Заменить index → uid в ProductForm, ProductVariantList, ProductVariantItem, variant-service
  - Убрать _tempId, использовать единый uid: VariantKey
- [x] Task 4: Прояснить и типизировать ID картинок (Image vs ProductImage) (depends on 3)
  - Branded types для ImageId и ProductImageId
  - Переименовать переменные для ясности

### Phase 2: Quality & Safety
- [x] Task 5: Добавить обработку ошибок во все серверные операции (depends on 3)
  - toast.error в onError для всех router вызовов
- [x] Task 6: Разделить ProductForm на подкомпоненты (depends on 3, 4)
  - Извлечь ProductBasicFields, ProductCategorySelect, useProductForm hook
  - Убрать хак descriptionNormalizedRef
- [x] Task 7: Улучшить type safety: branded types и strict checks (depends on 3, 4)
  - ServerProduct vs FormProduct, runtime guards

<!-- Commit checkpoint: tasks 3-7 -->

### Phase 3: Architecture & UX
- [x] Task 8: Упростить state management: заменить prop drilling на context (depends on 6, 7)
  - Zustand store для формы продукта
  - Убрать callback props из variant компонентов
- [x] Task 9: Добавить оптимистичные обновления (depends on 5, 8)
  - Variant image selection, image reorder, image detach
  - Utility optimisticUpdate<T>()
- [x] Task 10: Улучшить определение несохраненных изменений (depends on 6, 8)
  - TipTap JSON вместо HTML, custom comparison вместо lodash isEqual

<!-- Commit checkpoint: tasks 8-10 -->
