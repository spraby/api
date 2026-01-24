import * as React from "react"

import { router, usePage } from '@inertiajs/react';
import { MoreVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ResourceList } from '@/components/resource-list';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLang } from '@/lib/lang';
import type { BulkAction, Filter, ResourceListTranslations } from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type { ColumnDef } from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Option {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  values_count: number;
  created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createOptionColumns = (
  t: (key: string) => string,
  onDelete: (option: Option) => void,
  isDeleting: boolean
): ColumnDef<Option>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => { table.toggleAllPageRowsSelected(!!value); }}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => { row.toggleSelected(!!value); }}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: t('admin.options_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: t('admin.options_table.columns.name'),
    cell: ({ row }) => {
      const option = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{option.name}</span>
          {!!option.title && (
            <span className="text-sm text-muted-foreground">
              {option.title}
            </span>
          )}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const option = row.original
      const name = option.name.toLowerCase()
      const searchValue = value.toLowerCase()

      return name.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "values_count",
    header: t('admin.options_table.columns.values'),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("values_count")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: t('admin.options_table.columns.created'),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))

      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const option = row.original

      const handleEdit = () => {
        router.visit(`/sb/admin/options/${option.id}/edit`)
      }

      const handleDelete = () => {
        // eslint-disable-next-line no-alert
        if (!confirm(`${t('admin.options_table.confirm.delete_one')} ${option.name}?`)) {
          return
        }

        onDelete(option)
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                disabled={isDeleting}
                size="icon"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">{t('admin.options_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEdit}>{t('admin.options_table.actions.edit')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                {t('admin.options_table.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function Options() {
  const { t } = useLang();
  const { options } = usePage<{ options: Option[] }>().props;

  // State for operations
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Delete single option
  const handleDelete = React.useCallback((option: Option) => {
    setIsDeleting(true);

    router.delete(route('sb.admin.options.destroy', { option: option.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.options_table.success.deleted'));
      },
      onError: () => {
        toast.error(t('admin.options_table.errors.delete_failed'));
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  }, [t]);

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createOptionColumns(t, handleDelete, isDeleting),
    [t, handleDelete, isDeleting]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<Option>[] = React.useMemo(() => [
    // Bulk Delete
    {
      id: "delete",
      label: t('admin.options_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedOptions: Option[]) =>
        `${t('admin.options_table.confirm.delete_many')} ${selectedOptions.length} ${t('admin.options_table.confirm.options')}`,
      action: async (selectedOptions: Option[]) => {
        const optionIds = selectedOptions.map(o => o.id)

        router.post(route('sb.admin.options.bulk-delete'), {
          option_ids: optionIds
        }, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(t('admin.options_table.success.bulk_deleted'));
          },
          onError: () => {
            toast.error(t('admin.options_table.errors.bulk_delete_failed'));
          },
        });
      },
    },
  ], [t]);

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "name",
      placeholder: t('admin.options_table.filters.search_placeholder'),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.options_table.empty'),
    selected: t('admin.options_table.bulk.selected'),
    rowsSelected: t('admin.options_table.pagination.rows_selected'),
    row: t('admin.options_table.pagination.row'),
    rowsPerPage: t('admin.options_table.pagination.rows_per_page'),
    page: t('admin.options_table.pagination.page'),
    of: t('admin.options_table.pagination.of'),
    goFirst: t('admin.options_table.pagination.go_first'),
    goPrevious: t('admin.options_table.pagination.go_previous'),
    goNext: t('admin.options_table.pagination.go_next'),
    goLast: t('admin.options_table.pagination.go_last'),
    columns: t('admin.options_table.filters.columns'),
    clearSelection: t('admin.options_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.options.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.options.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.options.description')}
            </p>
          </div>
          <Button
            onClick={() => {
              router.visit('/sb/admin/options/create');
            }}
          >
            <PlusIcon className="size-4" />
            {t('admin.options.actions.create')}
          </Button>
        </div>

        <ResourceList
          bulkActions={bulkActions}
          columns={columns}
          data={options ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}
