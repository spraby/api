# ResourceList Component - Usage Guide

## Overview

`ResourceList` is a universal, type-safe table component for displaying and managing data resources with built-in features:

- ✅ Row selection with checkboxes
- ✅ Sorting, filtering, pagination
- ✅ Bulk actions on selected rows
- ✅ Column visibility toggle
- ✅ Responsive design with dark mode support
- ✅ Full i18n support

## Basic Usage

```tsx
import { ResourceList } from '@/components/resource-list';
import { BulkAction, Filter, ResourceListTranslations } from '@/types/resource-list';

interface MyData {
  id: number;
  name: string;
  status: string;
}

export default function MyPage() {
  const { data } = usePage<PageProps>();
  const { __ } = useLang();

  // Define columns
  const columns: ColumnDef<MyData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  // Define translations
  const translations: ResourceListTranslations = {
    empty: __('admin.table.empty'),
    selected: __('admin.table.selected'),
    rowsSelected: __('admin.table.rows_selected'),
    row: __('admin.table.row'),
    rowsPerPage: __('admin.table.rows_per_page'),
    page: __('admin.table.page'),
    of: __('admin.table.of'),
    goFirst: __('admin.table.go_first'),
    goPrevious: __('admin.table.go_previous'),
    goNext: __('admin.table.go_next'),
    goLast: __('admin.table.go_last'),
    columns: __('admin.table.columns'),
  };

  return (
    <ResourceList
      data={data}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      translations={translations}
    />
  );
}
```

## Advanced Features

### Bulk Actions Slot

Add custom UI elements (like dropdowns) before bulk action buttons:

```tsx
<ResourceList
  data={users}
  columns={columns}
  getRowId={(row) => row.id.toString()}
  translations={translations}
  bulkActionsSlot={() => (
    <Select value={selectedRole} onValueChange={setSelectedRole}>
      <SelectTrigger className="h-9 w-full sm:w-40">
        <SelectValue placeholder="Change role..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="manager">Manager</SelectItem>
      </SelectContent>
    </Select>
  )}
  bulkActions={bulkActions}
/>
```

### Bulk Actions

Define actions that can be performed on multiple selected rows:

```tsx
const bulkActions: BulkAction<MyData>[] = [
  {
    id: "delete",
    label: "Delete Selected",
    icon: Trash2Icon,
    variant: "destructive",
    confirmMessage: (rows) => `Delete ${rows.length} items?`,
    action: async (selectedRows) => {
      const ids = selectedRows.map(r => r.id);
      router.post('/delete', { ids });
    },
  },
  {
    id: "export",
    label: "Export",
    icon: DownloadIcon,
    variant: "outline",
    action: async (selectedRows) => {
      // Export logic
    },
  },
];
```

### Filters

Add search and select filters:

```tsx
const filters: Filter[] = [
  // Search filter
  {
    type: "search",
    columnId: "name",
    placeholder: "Search by name...",
  },
  // Select filter
  {
    type: "select",
    columnId: "status",
    placeholder: "All statuses",
    options: [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    defaultValue: "all",
  },
  // Custom filter
  {
    type: "custom",
    columnId: "custom",
    render: ({ value, onChange }) => (
      <YourCustomFilter value={value} onChange={onChange} />
    ),
  },
];
```

### Props Reference

```typescript
interface ResourceListProps<TData> {
  // Required
  data: TData[]                           // Data array
  columns: ColumnDef<TData>[]             // Column definitions
  getRowId: (row: TData) => string        // Get unique row ID
  translations: ResourceListTranslations  // UI translations

  // Optional
  bulkActions?: BulkAction<TData>[]       // Bulk actions
  filters?: Filter[]                      // Filters
  emptyMessage?: string                   // Empty state message
  defaultPageSize?: number                // Default: 10
  enableRowSelection?: boolean            // Default: true
  enableColumnVisibility?: boolean        // Default: true
  enablePagination?: boolean              // Default: true
  enableSorting?: boolean                 // Default: true
  pageSizeOptions?: number[]              // Default: [10, 20, 30, 40, 50]
  className?: string                      // Root container classes
  loading?: boolean                       // Loading state
  renderEmpty?: () => React.ReactNode     // Custom empty state
  onRowSelectionChange?: (rows: TData[]) => void  // Selection callback
}
```

## Real-World Example

See `resources/js/admin/Pages/Users.tsx` for a complete implementation with:
- Custom column definitions with badges and dropdowns
- Bulk delete and bulk role update actions
- Search and role filters
- Row actions (edit, delete)
- Full i18n support
