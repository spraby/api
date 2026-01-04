# Замена window.confirm на Popover для удаления изображений

Дата создания: 2026-01-04
Дата завершения: 2026-01-04

## Статус: ✅ ЗАВЕРШЕНО

## Описание

Заменить стандартное `window.confirm` на кастомный компонент подтверждения на основе Popover из shadcn/ui при удалении изображений продукта. Это улучшит пользовательский опыт и обеспечит консистентность UI.

## Требования

- ✅ Создать переиспользуемый компонент ConfirmationPopover
- ✅ Использовать Popover из shadcn/ui в качестве основы
- ✅ Добавить кнопки "Да" (Удалить) и "Нет" (Отмена)
- ✅ Поддержка состояния загрузки (isLoading)
- ✅ Полная локализация (en/ru)
- ✅ Использовать в ProductImagesManager

## Реализация

### Созданные файлы

**`resources/js/admin/components/confirmation-popover.tsx`** - новый компонент
```typescript
interface ConfirmationPopoverProps {
  trigger: ReactNode;        // Элемент-триггер (кнопка)
  message: string;            // Сообщение подтверждения
  onConfirm: () => void;      // Коллбэк при подтверждении
  onCancel?: () => void;      // Опциональный коллбэк при отмене
  isLoading?: boolean;        // Состояние загрузки
}
```

**Возможности:**
- Управляемое состояние open/onOpenChange
- Автоматическое закрытие после подтверждения/отмены
- Отключение кнопок во время загрузки
- Destructive вариант для кнопки подтверждения
- Полная поддержка локализации через useLang()

### Изменённые файлы

**`resources/js/admin/components/product-images-manager.tsx`**
- Импортирован ConfirmationPopover
- Удалён `window.confirm` из handleDelete
- Удалён eslint-disable комментарий (больше не нужен)
- Обёрнута кнопка удаления в ConfirmationPopover
- Передаётся состояние `detachImage.isPending` для показа загрузки

**`resources/js/admin/components/ui/popover.tsx`**
- Исправлены ESLint ошибки:
  - Добавлены пустые строки между import группами
  - Добавлены точки с запятой
  - Исправлены кавычки на одинарные
  - Добавлена пустая строка перед displayName

**`resources/lang/en/admin.php`**
- Добавлен ключ `common.deleting` = "Deleting..."

**`resources/lang/ru/admin.php`**
- Добавлен ключ `common.deleting` = "Удаление..."

## Преимущества нового подхода

### До (window.confirm):
❌ Блокирует весь UI браузера
❌ Нативный браузерный стиль (не кастомизируется)
❌ Нет поддержки состояния загрузки
❌ Не соответствует дизайн-системе приложения
❌ Требует eslint-disable комментария

### После (ConfirmationPopover):
✅ Не блокирует UI
✅ Консистентный стиль с остальным приложением
✅ Показывает состояние загрузки на кнопке
✅ Полная кастомизация через Tailwind CSS
✅ Поддержка темной темы из коробки
✅ Чистый код без eslint-disable

## Использование компонента

```tsx
<ConfirmationPopover
  trigger={
    <Button variant="destructive" size="icon">
      <TrashIcon className="size-4" />
    </Button>
  }
  message={t('admin.products_edit.images.confirm_delete')}
  isLoading={detachImage.isPending}
  onConfirm={() => handleDelete(productImageId)}
/>
```

## Линтинг

✅ ESLint прошёл успешно (0 ошибок)

## Технические детали

### shadcn/ui Popover
- Основан на @radix-ui/react-popover
- Управляемое состояние через Radix UI
- Автоматический Portal для правильного z-index
- Анимации входа/выхода через Tailwind CSS
- Правильное позиционирование с помощью Floating UI

### Доступность (a11y)
- Popover автоматически управляет фокусом
- Escape закрывает popover
- Click outside закрывает popover
- Кнопки имеют правильные aria-атрибуты

### Темизация
- Использует CSS переменные: `--popover`, `--popover-foreground`
- Автоматическая поддержка dark mode через `.dark` класс
- Консистентные цвета с остальными компонентами

## Чеклист

- [x] Проверить доступность Popover компонента
- [x] Создать ConfirmationPopover компонент
- [x] Обновить ProductImagesManager
- [x] Добавить локализацию (en/ru)
- [x] Исправить ESLint ошибки в popover.tsx
- [x] Запустить npm run lint
- [x] Убедиться что 0 ошибок

## Использование в проекте

ConfirmationPopover используется в следующих местах:

1. **ProductImagesManager** (`resources/js/admin/components/product-images-manager.tsx`)
   - Подтверждение удаления изображения продукта
   - Сообщение: `admin.products_edit.images.confirm_delete`

2. **ProductEdit - Варианты** (`resources/js/admin/Pages/ProductEdit.tsx`)
   - Подтверждение удаления изображения варианта
   - Сообщение: `admin.products_edit.variants.confirm_remove_image`

## Возможности для повторного использования

ConfirmationPopover является универсальным компонентом и может использоваться в других местах приложения где требуется подтверждение действия:
- Удаление пользователей
- Удаление продуктов
- Удаление категорий
- Любые другие деструктивные действия

Компонент полностью переиспользуемый благодаря:
- Гибкому API (trigger + message + callbacks)
- Поддержке состояния загрузки
- Полной локализации
- Кастомизируемому внешнему виду

## Дополнения (2026-01-04)

### Добавлено использование для вариантов продукта

**Изменённые файлы:**

**`resources/js/admin/Pages/ProductEdit.tsx`**
- Добавлен импорт ConfirmationPopover
- Заменена кнопка удаления изображения варианта на popover
- Показывается состояние `setVariantImage.isPending`

**Локализация:**
- **EN**: `admin.products_edit.variants.confirm_remove_image` = "Remove image from this variant?"
- **RU**: `admin.products_edit.variants.confirm_remove_image` = "Удалить изображение из этого варианта?"

**Код:**
```tsx
<ConfirmationPopover
  isLoading={setVariantImage.isPending}
  message={t('admin.products_edit.variants.confirm_remove_image')}
  trigger={
    <Button
      disabled={updateProduct.isPending || !variant.id}
      size="icon"
      type="button"
      variant="destructive"
    >
      <TrashIcon className="size-4" />
    </Button>
  }
  onConfirm={() => {
    removeVariantImage(index);
  }}
/>
```

✅ Линтинг прошёл успешно (0 ошибок)