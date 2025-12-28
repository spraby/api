# Создание универсального компонента ResourceList

Дата создания: 2025-12-28

## Описание

Создать универсальный компонент ResourceList на основе UsersTable, который можно использовать для отображения любых ресурсов (users, products, orders и т.д.) с полной настройкой через props.

## Архитектурные принципы

1. **Generic Types** - TypeScript generics для типобезопасности
2. **Composition over inheritance** - настройка через props, а не наследование
3. **Separation of concerns** - отдельная логика UI и бизнес-логики
4. **Reusability** - легко адаптировать для разных ресурсов
5. **Extensibility** - возможность расширения функциональности

## Ключевые возможности

### Обязательные:
- ✅ Отображение данных в табличном виде (@tanstack/react-table)
- ✅ Настраиваемые колонки через props
- ✅ Пагинация (10, 20, 30, 40, 50 строк на страницу)
- ✅ Сортировка
- ✅ Выбор строк (checkboxes)
- ✅ Видимость колонок (column visibility)
- ✅ Empty state
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility (ARIA labels)
- ✅ i18n через translations prop

### Опциональные (через props):
- ✅ Bulk actions (массовые операции)
- ✅ Row actions (действия над строкой)
- ✅ Фильтры (search, select, custom)
- ✅ Custom cell renderers

## Структура компонента

### ResourceList Props Interface

```typescript
interface ResourceListProps<TData> {
  // Обязательные
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowId: (row: TData) => string
  translations: ResourceListTranslations

  // Опциональные
  bulkActions?: BulkAction<TData>[]
  filters?: Filter[]
  emptyMessage?: string
  defaultPageSize?: number
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
}

interface ResourceListTranslations {
  empty: string
  selected: string
  rows: string
  rowsPerPage: string
  page: string
  of: string
  columns: string
  // ... другие переводы
}

interface BulkAction<TData> {
  label: string
  icon?: React.ComponentType
  variant?: 'default' | 'destructive' | 'outline'
  action: (selectedRows: TData[]) => void | Promise<void>
  confirmMessage?: string | ((count: number) => string)
  disabled?: (selectedRows: TData[]) => boolean
}

interface Filter {
  type: 'search' | 'select' | 'custom'
  columnId: string
  placeholder?: string
  options?: { label: string; value: string }[]
  render?: () => React.ReactNode
}
```

## Чеклист выполнения

- [ ] **Этап 1: Типы и интерфейсы**
  - [ ] Создать `types/resource-list.ts` с интерфейсами
  - [ ] Определить `ResourceListProps<TData>`
  - [ ] Определить `ResourceListTranslations`
  - [ ] Определить `BulkAction<TData>`
  - [ ] Определить `Filter`
  - [ ] Экспортировать все типы

- [ ] **Этап 2: Основной компонент ResourceList**
  - [ ] Создать `components/resource-list.tsx`
  - [ ] Настроить useReactTable с generic типом
  - [ ] Реализовать state management (sorting, filters, pagination, selection)
  - [ ] Реализовать мемоизацию для оптимизации

- [ ] **Этап 3: UI структура**
  - [ ] Реализовать Bulk Actions Bar (условный рендер)
  - [ ] Реализовать Filters Bar (условный рендер)
  - [ ] Реализовать Table с responsive wrapper
  - [ ] Реализовать Pagination controls
  - [ ] Реализовать Empty state

- [ ] **Этап 4: Функциональность фильтров**
  - [ ] Реализовать Search Filter
  - [ ] Реализовать Select Filter
  - [ ] Реализовать Custom Filter
  - [ ] Реализовать Column Visibility dropdown

- [ ] **Этап 5: Bulk Actions**
  - [ ] Реализовать рендер bulk actions
  - [ ] Реализовать confirm dialog для опасных действий
  - [ ] Реализовать loading state
  - [ ] Реализовать toast notifications для результатов

- [ ] **Этап 6: Адаптация UsersTable**
  - [ ] Создать колонки для Users через createColumns
  - [ ] Создать translations для Users
  - [ ] Создать bulk actions для Users (delete, change role)
  - [ ] Создать filters для Users (search, role)
  - [ ] Заменить UsersTable на ResourceList в Pages/Users.tsx

- [ ] **Этап 7: Документация и примеры**
  - [ ] Добавить JSDoc комментарии к компоненту
  - [ ] Создать пример использования в комментариях
  - [ ] Обновить translations в `lang/en/admin.php`
  - [ ] Обновить translations в `lang/ru/admin.php`

- [ ] **Этап 8: Тестирование**
  - [ ] Проверить работу на странице Users
  - [ ] Проверить responsive behavior
  - [ ] Проверить dark mode
  - [ ] Проверить accessibility
  - [ ] Проверить все bulk actions
  - [ ] Проверить все фильтры
  - [ ] Проверить пагинацию

## Файловая структура

```
api/resources/js/admin/
├── types/
│   └── resource-list.ts          # NEW - типы и интерфейсы
├── components/
│   ├── resource-list.tsx         # NEW - универсальный компонент
│   ├── users-table.tsx           # УДАЛИТЬ после миграции
│   └── ui/                       # существующие shadcn компоненты
└── Pages/
    └── Users.tsx                 # ОБНОВИТЬ - использовать ResourceList
```

## Пример использования (для документации)

```tsx
// Pages/Users.tsx
import { ResourceList } from "@/components/resource-list"
import { createUserColumns } from "@/config/user-columns"
import { userBulkActions } from "@/config/user-bulk-actions"
import { userFilters } from "@/config/user-filters"

export default function Users() {
  const { users } = usePage<UsersPageProps>().props
  const { __ } = useLang()

  return (
    <AdminLayout>
      <ResourceList
        data={users}
        columns={createUserColumns(__)}
        getRowId={(row) => row.id.toString()}
        translations={{
          empty: __('admin.resource_list.empty'),
          selected: __('admin.resource_list.selected'),
          // ... остальные переводы
        }}
        bulkActions={userBulkActions(__)}
        filters={userFilters(__)}
      />
    </AdminLayout>
  )
}
```

## Преимущества нового подхода

1. **Переиспользуемость**: Один компонент для всех ресурсов
2. **Типобезопасность**: Generic типы обеспечивают корректность данных
3. **Гибкость**: Полная настройка через props
4. **Консистентность**: Единый UX для всех списков
5. **Поддерживаемость**: Изменения в одном месте применяются везде
6. **Расширяемость**: Легко добавлять новые возможности

## Технические детали

### Используемые библиотеки:
- @tanstack/react-table v8 - для работы с таблицей
- lucide-react - иконки
- sonner - toast уведомления
- shadcn/ui - UI компоненты
- Inertia.js - навигация и запросы

### Оптимизация производительности:
- React.useMemo для колонок и данных
- React.useCallback для обработчиков
- Lazy loading для больших списков (будущее улучшение)
- Виртуализация строк для очень больших таблиц (будущее улучшение)

## Будущие улучшения (не в этой задаче)

- [ ] Добавить экспорт данных (CSV, Excel)
- [ ] Добавить сохранение настроек таблицы (column visibility, pageSize)
- [ ] Добавить inline редактирование
- [ ] Добавить drag-and-drop для изменения порядка (как в DataTable)
- [ ] Добавить группировку строк
- [ ] Добавить виртуализацию для больших списков