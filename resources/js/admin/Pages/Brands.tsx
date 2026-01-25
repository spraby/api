import * as React from "react"

import {router, usePage} from '@inertiajs/react';
import {MoreVerticalIcon, PlusIcon, Trash2Icon, UserCheckIcon} from "lucide-react"
import {toast} from "sonner"

import {ResourceList} from '@/components/resource-list';
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useLang} from '@/lib/lang';
import type {PageProps} from '@/types/inertia';
import type {BulkAction, Filter, ResourceListTranslations} from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type {ColumnDef} from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Brand {
  id: number;
  name: string;
  description: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  products_count: number;
  created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createBrandColumns = (
    t: (key: string) => string,
    onDelete: (brand: Brand) => void,
    onImpersonate: (userId: number) => void,
    isDeleting: boolean,
    canImpersonate: boolean
): ColumnDef<Brand>[] => [
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
    header: t('admin.brands_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: t('admin.brands_table.columns.name'),
    cell: ({ row }) => {
      const brand = row.original

      return (
        <div className="flex flex-col">
          <span className="font-medium">{brand.name}</span>
          {!!brand.description && (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {brand.description}
            </span>
          )}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const brand = row.original
      const name = brand.name.toLowerCase()
      const searchValue = value.toLowerCase()

      return name.includes(searchValue)
    },
    enableHiding: false,
  },
    {
        accessorKey: "user",
        header: t('admin.brands_table.columns.owner'),
        cell: ({row}) => {
            const brand = row.original

            return (
                <div className="text-sm">
                    {brand.user ? (
                        <a
                            className="flex flex-col hover:underline cursor-pointer"
                            href={`/sb/admin/users/${brand.user.id}/edit`}
                            onClick={(e) => {
                                e.preventDefault()
                                router.visit(e.currentTarget.href)
                            }}
                        >
                            <span className="font-medium text-primary">{brand.user.name}</span>
                            <span className="text-muted-foreground">{brand.user.email}</span>
                        </a>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
    },
  {
    accessorKey: "products_count",
    header: t('admin.brands_table.columns.products'),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("products_count")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: t('admin.brands_table.columns.created'),
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
        cell: ({row}) => {
            const brand = row.original

            const handleEdit = () => {
                router.visit(`/sb/admin/brands/${brand.id}/edit`)
            }

            const handleDelete = () => {
                // eslint-disable-next-line no-alert
                if (!confirm(`${t('admin.brands_table.confirm.delete_one')} ${brand.name}?`)) {
                    return
                }

                onDelete(brand)
            }

            const handleImpersonate = () => {
                if (brand.user) {
                    onImpersonate(brand.user.id)
                }
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
                                <MoreVerticalIcon className="size-4"/>
                                <span className="sr-only">{t('admin.brands_table.actions.open_menu')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={handleEdit}>
                                {t('admin.brands_table.actions.edit')}
                            </DropdownMenuItem>
                            {canImpersonate && brand.user ? (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleImpersonate}>
                                        <UserCheckIcon className="mr-2 size-4"/>
                                        {t('admin.impersonation.impersonate') || 'Impersonate'}
                                    </DropdownMenuItem>
                                </>
                            ) : null}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                {t('admin.brands_table.actions.delete')}
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

export default function Brands() {
    const {t} = useLang();
    const {brands, auth} = usePage<PageProps & { brands: Brand[] }>().props;

    // State for operations
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Check if current user can impersonate (admins only)
    const canImpersonate = auth?.user?.is_admin ?? false;

    // Delete single brand
    const handleDelete = React.useCallback((brand: Brand) => {
        setIsDeleting(true);

        router.delete(route('sb.admin.brands.destroy', {brand: brand.id}), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.brands_table.success.deleted'));
            },
            onError: () => {
                toast.error(t('admin.brands_table.errors.delete_failed'));
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [t]);

    // Impersonate user
    const handleImpersonate = React.useCallback((userId: number) => {
        router.post(route('sb.admin.impersonate', {user: userId}), {}, {
            preserveScroll: true,
        });
    }, []);

    // ============================================
    // COLUMNS
    // ============================================

    const columns = React.useMemo(
        () => createBrandColumns(t, handleDelete, handleImpersonate, isDeleting, canImpersonate),
        [t, handleDelete, handleImpersonate, isDeleting, canImpersonate]
    );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<Brand>[] = React.useMemo(() => [
    // Bulk Delete
    {
      id: "delete",
      label: t('admin.brands_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedBrands: Brand[]) =>
        `${t('admin.brands_table.confirm.delete_many')} ${selectedBrands.length} ${t('admin.brands_table.confirm.brands')}`,
      action: async (selectedBrands: Brand[]) => {
        const brandIds = selectedBrands.map(b => b.id)

        router.post(route('sb.admin.brands.bulk-delete'), {
          brand_ids: brandIds
        }, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(t('admin.brands_table.success.bulk_deleted'));
          },
          onError: () => {
            toast.error(t('admin.brands_table.errors.bulk_delete_failed'));
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
      placeholder: t('admin.brands_table.filters.search_placeholder'),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.brands_table.empty'),
    selected: t('admin.brands_table.bulk.selected'),
    rowsSelected: t('admin.brands_table.pagination.rows_selected'),
    row: t('admin.brands_table.pagination.row'),
    rowsPerPage: t('admin.brands_table.pagination.rows_per_page'),
    page: t('admin.brands_table.pagination.page'),
    of: t('admin.brands_table.pagination.of'),
    goFirst: t('admin.brands_table.pagination.go_first'),
    goPrevious: t('admin.brands_table.pagination.go_previous'),
    goNext: t('admin.brands_table.pagination.go_next'),
    goLast: t('admin.brands_table.pagination.go_last'),
    columns: t('admin.brands_table.filters.columns'),
    clearSelection: t('admin.brands_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={t('admin.brands.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.brands.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.brands.description')}
            </p>
          </div>
          <Button
            onClick={() => {
              router.visit('/sb/admin/brands/create');
            }}
          >
            <PlusIcon className="size-4" />
            {t('admin.brands.actions.create')}
          </Button>
        </div>

        <ResourceList
          bulkActions={bulkActions}
          columns={columns}
          data={brands ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}