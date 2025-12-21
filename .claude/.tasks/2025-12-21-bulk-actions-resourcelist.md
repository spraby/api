# Bulk Actions для ResourceList

Дата создания: 2025-12-21

## Описание
Добавить поддержку массовых действий (bulk actions) в компонент ResourceList. Bulk actions должны передаваться через пропсы и отображаться когда выбраны элементы.

## Требования
- Передавать bulk actions через пропсы
- Использовать существующий `selectionMode` для выбора элементов
- Показывать панель с bulk actions когда есть выбранные элементы
- Использовать PrimeVue компоненты для UI
- Поддерживать подтверждение для опасных действий
- Эмитить события при выполнении bulk actions

## Чеклист

- [x] **Раздел 1: Типы и интерфейсы**
  - [x] Добавить тип `BulkActionConfig` в `useResourceList.ts`
  - [x] Добавить проп `bulkActions` в `ResourceListProps`
  - [x] Добавить новые эмиты для bulk actions

- [x] **Раздел 2: UI компоненты**
  - [x] Добавить панель с bulk actions (Toolbar с Button компонентами)
  - [x] Отображать кол-во выбранных элементов
  - [x] Добавить кнопку "Снять выделение"
  - [x] Стилизовать панель с использованием Tailwind и темных вариантов

- [x] **Раздел 3: Логика обработки**
  - [x] Создать computed для отслеживания выбранных элементов
  - [x] Добавить метод `handleBulkAction` для обработки действий
  - [x] Добавить подтверждение для опасных bulk actions (если `requireConfirm: true`)
  - [x] Очищать selection после выполнения действия

- [x] **Раздел 4: Пример использования**
  - [x] Обновить пример в Products/Index.vue для демонстрации bulk actions

## Результат

Реализована полная поддержка bulk actions в компоненте ResourceList:

### Добавленные возможности:
1. **Типы и интерфейсы** (`useResourceList.ts`):
   - Интерфейс `BulkActionConfig` с полями: type, label, icon, severity, requireConfirm, confirmMessage, confirmHeader, visible, disabled, handler

2. **UI компоненты** (`ResourceList.vue`):
   - Панель bulk actions с primary фоном
   - Отображение количества выбранных элементов
   - Кнопка "Снять выделение"
   - Поддержка dark mode через Tailwind классы

3. **Логика обработки**:
   - `selectedItems` ref для хранения выбранных элементов
   - `hasSelectedItems` computed
   - `visibleBulkActions` computed с фильтрацией по visible()
   - `handleBulkAction()` с поддержкой подтверждения
   - `executeBulkAction()` для выполнения действий
   - `clearSelection()` для очистки выделения

4. **Пример использования** (`Products/Index.vue`):
   - Добавлены 3 bulk actions: Активировать, Деактивировать, Удалить
   - Реализованы обработчики `handleBulkEnable()` и `handleBulkDelete()`
   - Включен `selection-mode="multiple"`

### API эндпоинты (требуется реализация на backend):
- `POST /sb/admin/api/products/bulk-update` - массовое обновление enabled
- `POST /sb/admin/api/products/bulk-delete` - массовое удаление
