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

interface Collection {
  id: number;
  handle: string;
  name: string;
  title: string | null;
  header: string | null;
  description: string | null;
  categories_count: number;
  created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createCollectionColumns = (
  t: (key: string) => string,
  onDelete: (collection: Collection) => void,
  isDeleting: boolean
): ColumnDef<Collection>[] => [
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
    header: t('admin.collections_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: t('admin.collections_table.columns.name'),
    cell: ({ row }) => {
      const collection = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{collection.name}</span>
          {!!collection.handle && (
            <span className="text-sm text-muted-foreground">
              /{collection.handle}
            </span>
          )}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const collection = row.original
      const name = collection.name.toLowerCase()
      const searchValue = value.toLowerCase()

      return name.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: t('admin.collections_table.columns.title'),
    cell: ({ row }) => {
      const collection = row.original

      return (
        <div className="text-sm">
          {collection.title || <span className="text-muted-foreground">—</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "categories_count",
    header: t('admin.collections_table.columns.categories'),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("categories_count")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: t('admin.collections_table.columns.created'),
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
      const collection = row.original

      const handleEdit = () => {
        router.visit(`/admin/collections/${collection.id}/edit`)
      }

      const handleDelete = () => {
        // eslint-disable-next-line no-alert
        if (!confirm(`${t('admin.collections_table.confirm.delete_one')} ${collection.name}?`)) {
          return
        }

        onDelete(collection)
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
                <span className="sr-only">{t('admin.collections_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEdit}>{t('admin.collections_table.actions.edit')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                {t('admin.collections_table.actions.delete')}
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

export default function Collections() {
  const { t } = useLang();
  const { collections } = usePage<{ collections: Collection[] }>().props;

  // State for operations
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Delete single collection
  const handleDelete = React.useCallback((collection: Collection) => {
    setIsDeleting(true);

    router.delete(route('admin.collections.destroy', { collection: collection.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.collections_table.success.deleted'));
      },
      onError: () => {
        toast.error(t('admin.collections_table.errors.delete_failed'));
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
    () => createCollectionColumns(t, handleDelete, isDeleting),
    [t, handleDelete, isDeleting]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<Collection>[] = React.useMemo(() => [
    // Bulk Delete
    {
      id: "delete",
      label: t('admin.collections_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedCollections: Collection[]) =>
        `${t('admin.collections_table.confirm.delete_many')} ${selectedCollections.length} ${t('admin.collections_table.confirm.collections')}`,
      action: async (selectedCollections: Collection[]) => {
        const collectionIds = selectedCollections.map(c => c.id)

        router.post(route('admin.collections.bulk-delete'), {
          collection_ids: collectionIds
        }, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(t('admin.collections_table.success.bulk_deleted'));
          },
          onError: () => {
            toast.error(t('admin.collections_table.errors.bulk_delete_failed'));
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
      placeholder: t('admin.collections_table.filters.search_placeholder'),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.collections_table.empty'),
    selected: t('admin.collections_table.bulk.selected'),
    rowsSelected: t('admin.collections_table.pagination.rows_selected'),
    row: t('admin.collections_table.pagination.row'),
    rowsPerPage: t('admin.collections_table.pagination.rows_per_page'),
    page: t('admin.collections_table.pagination.page'),
    of: t('admin.collections_table.pagination.of'),
    goFirst: t('admin.collections_table.pagination.go_first'),
    goPrevious: t('admin.collections_table.pagination.go_previous'),
    goNext: t('admin.collections_table.pagination.go_next'),
    goLast: t('admin.collections_table.pagination.go_last'),
    columns: t('admin.collections_table.filters.columns'),
    clearSelection: t('admin.collections_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.collections.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.collections.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.collections.description')}
            </p>
          </div>
          <Button
            onClick={() => {
              router.visit('/admin/collections/create');
            }}
          >
            <PlusIcon className="size-4" />
            {t('admin.collections.actions.create')}
          </Button>
        </div>

        <ResourceList
          bulkActions={bulkActions}
          columns={columns}
          data={collections ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}
