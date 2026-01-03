# Задача: Реализовать Rich Text Editor для поля description

Дата создания: 2026-01-03

## Описание
На странице редактирования продукта в React/Inertia админке поле description должно быть реализовано как Rich Text Editor (как в Filament), а не обычный Textarea.

## Текущее состояние

**Filament** (`app/Filament/Resources/Products/Schemas/ProductForm.php:40-54`):
```php
RichEditor::make('description')
    ->columnSpanFull()
    ->toolbarButtons([
        'bold',
        'italic',
        'underline',
        'strike',
        'orderedList',
        'bulletList',
        'undo',
        'redo',
    ])
    ->label(__('filament-resources.resources.product.fields.description'))
    ->maxLength(65535)
    ->columnSpanFull(),
```

**React Admin** (`resources/js/admin/Pages/ProductEdit.tsx:208-218`):
```tsx
<Textarea
    disabled={updateProduct.isPending}
    id="description"
    placeholder={t('admin.products_edit.placeholders.description')}
    rows={4}
    value={formData.description}
    onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
/>
```

## Чеклист

- [x] **Раздел 1: Выбор и установка библиотеки**
  - [x] Выбрать библиотеку Rich Text Editor (TipTap/Quill/Slate)
  - [x] Установить зависимости через npm
  - [x] Проверить совместимость с React 19 и TypeScript

- [x] **Раздел 2: Создание компонента RichTextEditor**
  - [x] Создать компонент `resources/js/admin/components/ui/rich-text-editor.tsx`
  - [x] Реализовать toolbar с кнопками: bold, italic, underline, strike, orderedList, bulletList, undo, redo
  - [x] Добавить поддержку темной темы (dark mode)
  - [x] Добавить TypeScript типы для пропсов
  - [x] Стилизовать компонент в соответствии с shadcn/ui дизайном
  - [x] Добавить disabled состояние
  - [x] Добавить placeholder
  - [x] Реализовать controlled component (value + onChange)

- [x] **Раздел 3: Интеграция в ProductEdit**
  - [x] Импортировать RichTextEditor в ProductEdit.tsx
  - [x] Заменить Textarea на RichTextEditor
  - [x] Убедиться что данные корректно сохраняются/загружаются
  - [x] Проверить что HTML форматирование сохраняется в базе данных

- [x] **Раздел 4: Тестирование**
  - [x] Проверить сборку через npm run build
  - [x] Проверить код через ESLint (npm run lint)
  - [x] Исправить все ошибки линтера

- [ ] **Раздел 5: Документация (опционально)**
  - [ ] Добавить комментарии к компоненту RichTextEditor
  - [ ] Обновить типы если необходимо

## Технические детали

**Рекомендуемая библиотека**: TipTap
- Современная и активно поддерживается
- Хорошая интеграция с React
- Легко настраивается
- Поддержка всех нужных форматов

**Альтернативы**:
- Quill (простой, легкий)
- Slate (более гибкий, но сложнее)
- Draft.js (устаревший, не рекомендуется)

**Формат данных**: HTML (как в Filament RichEditor)