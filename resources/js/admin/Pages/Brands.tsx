import * as React from "react"

import {Link, router, usePage} from '@inertiajs/react';
import {
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    MoreVerticalIcon,
    PlusIcon,
    Trash2Icon,
    UserCheckIcon,
} from "lucide-react"
import {toast} from "sonner"

import {MediaThumbnail} from '@/components/media-thumbnail';
import {ResourceList} from '@/components/resource-list';
import {Badge} from "@/components/ui/badge"
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
import {cn} from '@/lib/utils';
import type {PageProps} from '@/types/inertia';
import type {BulkAction, Filter, ResourceListTranslations} from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type {Column, ColumnDef} from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  type: string;
  admin_url: string;
  user: {
    id: number;
    name: string;
    email: string;
    admin_url: string;
  } | null;
  products_count: number;
  created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

/** Тип бренда: мастер — частный продавец, бизнес — компания со своей страницей. */
function BrandTypeBadge({type, t}: {type: string; t: (key: string) => string}) {
  const label = t(`admin.brands_table.types.${type}`)
  const isBusiness = type === 'business'

  return (
    <Badge
      className={cn(
        'shrink-0',
        isBusiness
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      )}
      variant="outline"
    >
      {label.startsWith('admin.') ? type : label}
    </Badge>
  )
}

/** Заголовок-кнопка: клик переключает направление сортировки колонки. */
function SortableHeader({column, label}: {column: Column<Brand, unknown>; label: string}) {
  const sorted = column.getIsSorted()
  const SORT_ICONS = {asc: ArrowUpIcon, desc: ArrowDownIcon} as const
  const Icon = sorted ? SORT_ICONS[sorted] : ArrowUpDownIcon

  return (
    <Button
      className="-ml-2 h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[sorted=true]:text-foreground"
      data-sorted={!!sorted}
      size="sm"
      type="button"
      variant="ghost"
      onClick={() => { column.toggleSorting(sorted === "asc") }}
    >
      {label}
      <Icon className="ml-1 size-3"/>
    </Button>
  )
}

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
    id: "logo",
    header: t('admin.brands_table.columns.logo'),
    cell: ({ row }) => {
      const brand = row.original

      return (
        <Link className="inline-flex" href={brand.admin_url} title={brand.name}>
          <MediaThumbnail
            className="size-10 rounded-md"
            name={brand.name}
            url={brand.logo_url}
          />
        </Link>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: t('admin.brands_table.columns.name'),
    cell: ({ row }) => {
      const brand = row.original

      return (
        <div className="flex flex-col">
          <Link className="font-medium text-primary hover:underline" href={brand.admin_url}>
            {brand.name}
          </Link>
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
    accessorKey: "type",
    header: t('admin.brands_table.columns.type'),
    cell: ({ row }) => <BrandTypeBadge t={t} type={row.original.type}/>,
    filterFn: (row, id, value) => {
      if (value === "all" || !value) {
        return true
      }

      return row.getValue(id) === value
    },
  },
    {
        accessorKey: "user",
        header: t('admin.brands_table.columns.owner'),
        cell: ({row}) => {
            const brand = row.original

            return (
                <div className="text-sm">
                    {brand.user ? (
                        <Link className="flex flex-col hover:underline" href={brand.user.admin_url}>
                            <span className="font-medium text-primary">{brand.user.name || brand.user.email}</span>
                            <span className="text-muted-foreground">{brand.user.email}</span>
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
    },
  {
    accessorKey: "products_count",
    header: ({ column }) => (
      <SortableHeader column={column} label={t('admin.brands_table.columns.products')}/>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("products_count")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <SortableHeader column={column} label={t('admin.brands_table.columns.created')}/>
    ),
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
                router.visit(`/admin/brands/${brand.id}/edit`)
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

        router.delete(route('admin.brands.destroy', {brand: brand.id}), {
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
        router.post(route('admin.impersonate', {user: userId}), {}, {
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

        router.post(route('admin.brands.bulk-delete'), {
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
              router.visit('/admin/brands/create');
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
          onRowClick={(brand) => { router.visit(brand.admin_url) }}
        />
      </div>
    </AdminLayout>
  );
}