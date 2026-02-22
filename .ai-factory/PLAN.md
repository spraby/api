# Implementation Plan: Рефакторинг страницы продукта (аудит + чистка)

Branch: main
Created: 2026-02-22
Testing: no

## Overview

Аудит страницы создания/редактирования продукта. Найдены следующие проблемы:
- Мертвый код и лишние type cast
- Баги: пагинация, дублирование вариантов, утечка памяти blob URL
- Нарушения темы: хардкодные цвета вместо CSS-переменных
- Нелокализованные строки
- Accessibility: некорректный role="none"
- Performance: отсутствие useMemo там где нужно

## Commit Plan

- **Commit 1** (после tasks 1-3): "fix: dead code, type casts, accessibility и i18n"
- **Commit 2** (после tasks 4-6): "fix: theme colors, memory leak, pagination bug"
- **Commit 3** (после task 7): "fix: optimize use-product-form logic and performance"

## Tasks

### Phase 1: Быстрые фиксы
- [x] Task 1: Убрать мертвый код и лишние type cast в product-form.tsx
- [x] Task 2: Исправить accessibility: role="none" → role="presentation" в variant-row.tsx
- [x] Task 3: Исправить нелокализованный текст кнопки "Choose" в image-picker-dialog
<!-- 🔄 Commit checkpoint: tasks 1-3 -->

### Phase 2: Тема, память, пагинация
- [x] Task 4: Заменить хардкодные цвета темой в product-variants-card.tsx
- [x] Task 5: Исправить утечку памяти blob URL при размонтировании (use-product-form.ts)
- [x] Task 6: Исправить баг пагинации в image-picker.tsx
<!-- 🔄 Commit checkpoint: tasks 4-6 -->

### Phase 3: Оптимизация логики
- [x] Task 7: Оптимизация и исправление логики в use-product-form.ts (useMemo, type guards, дедупликация)
<!-- 🔄 Commit checkpoint: task 7 -->

### Phase 4: Финализация
- [x] Task 8: Финальная проверка: lint + ревью всех изменений (blocked by: 1-7)

## Ключевые файлы

| Файл | Действие |
|------|----------|
| `resources/js/admin/components/product-form.tsx` | Убрать `!!isEdit`, type cast |
| `resources/js/admin/components/variant-row.tsx` | role="none" → role="presentation" |
| `resources/js/admin/components/image-picker.tsx` | Локализация "Choose", фикс пагинации |
| `resources/js/admin/components/product-variants-card.tsx` | Замена зелёных/синих цветов |
| `resources/js/admin/hooks/use-product-form.ts` | Cleanup blob URLs, useMemo, type guards |

---

# ARCHIVED: Implementation Plan: Redesign Product Create/Edit Page

Branch: main
Created: 2026-02-22
Testing: no
SKU/Stock: skipped (no migration)

## Overview

Full redesign of the React/Inertia product create/edit page (`ProductEdit.tsx` + sub-components)
to match the provided specification.

**Scope:** Frontend React components only. Backend (Laravel routes, controller, models) already
supports all needed data. No new migrations.

**DB price mapping:**
- UI "Цена" (current selling price) → DB `final_price`
- UI "До скидки" (original price) → DB `price`

## Architecture

```
ProductEdit.tsx
  └── product-form.tsx (rewritten)
        ├── TopBar (inline component)
        ├── [Left column]
        │   ├── product-basic-fields-card.tsx (updated)
        │   ├── product-category-card.tsx (rewritten: chips + options)
        │   └── product-variants-card.tsx (rewritten: full management)
        │       └── variant-row.tsx (new)
        └── [Right column, sticky]
            ├── product-images-card.tsx (updated: drop zone)
            └── product-summary-card.tsx (new)
```

**Central state:** `hooks/use-product-form.ts` (new hook)
**Shared primitive:** `components/step-header.tsx` (new)

## Commit Plan

- **Commit 1** (after tasks 1-2): "feat: add useProductForm hook and StepHeader component"
- **Commit 2** (after tasks 3-5): "feat: update BasicInfoCard, CategoryCard, and VariantRow"
- **Commit 3** (after tasks 6-8): "feat: rewrite VariantsCard, update ImagesCard, add SummaryCard"
- **Commit 4** (after task 9): "feat: rewrite product-form layout with TopBar and form submission"

## Tasks

### Phase 1: Foundation
- [x] Task 1: Create `useProductForm` hook — central state management
- [x] Task 2: Create `StepHeader` component
<!-- 🔄 Commit checkpoint: tasks 1-2 -->

### Phase 2: Card Components
- [x] Task 3: Update `ProductBasicFieldsCard` with StepHeader + spec styling (blocked by: 2)
- [x] Task 4: Rewrite `ProductCategoryCard` — category chips + option blocks + generate button (blocked by: 1, 2)
- [x] Task 5: Create `VariantRow` component — collapsible row with delete overlay (blocked by: 1)
<!-- 🔄 Commit checkpoint: tasks 3-5 -->

### Phase 3: Full Sections
- [x] Task 6: Rewrite `ProductVariantsCard` — full variant management UI (blocked by: 1, 2, 5)
- [x] Task 7: Update `ProductImagesCard` — add drag & drop file upload zone (blocked by: 1, 2)
- [x] Task 8: Create `ProductSummaryCard` — reactive summary panel (blocked by: 1)
<!-- 🔄 Commit checkpoint: tasks 6-8 -->

### Phase 4: Assembly
- [x] Task 9: Rewrite `product-form.tsx` — new layout, TopBar, form submission (blocked by: 3-8)
<!-- 🔄 Commit checkpoint: task 9 -->

## Key Files

| File | Action |
|------|--------|
| `resources/js/admin/hooks/use-product-form.ts` | CREATE |
| `resources/js/admin/components/step-header.tsx` | CREATE |
| `resources/js/admin/components/variant-row.tsx` | CREATE |
| `resources/js/admin/components/product-summary-card.tsx` | CREATE |
| `resources/js/admin/components/product-basic-fields-card.tsx` | UPDATE |
| `resources/js/admin/components/product-category-card.tsx` | REWRITE |
| `resources/js/admin/components/product-variants-card.tsx` | REWRITE |
| `resources/js/admin/components/product-images-card.tsx` | UPDATE |
| `resources/js/admin/components/product-form.tsx` | REWRITE |
| `resources/css/admin.css` | UPDATE (add slideUp animation) |

## Backend Context (reference)

The controller already provides:
- `brand.categories.options.values` — all categories with their options and option values
- Product with `variants.values.value`, `variants.values.option`
- Image endpoints: upload, attach, detach, reorder

Routes:
- `admin.products.store` — POST (create)
- `admin.products.update` — PUT/{product} (edit)
- `admin.products.images.upload` — POST (upload files, edit mode)
- `admin.products.images.reorder` — PUT (reorder, edit mode)
- `admin.products.images.detach` — DELETE (remove, edit mode)
