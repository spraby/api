import * as React from "react"

import {router, usePage} from '@inertiajs/react';
import {ImageIcon, MoreVerticalIcon, PackageIcon, PlusIcon, Trash2Icon} from "lucide-react"
import {toast} from "sonner"

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
import {Input} from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {useLang} from '@/lib/lang';
import {toMoneyFormat} from '@/lib/utils';
import type {BulkAction, Filter, ResourceListTranslations} from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type {ColumnDef} from "@tanstack/react-table"

// ============================================
// TYPES
// ============================================

interface Product {
    id: number;
    title: string;
    description: string | null;
    enabled: boolean;
    brand_id: number;
    category_id: number | null;
    brand: {
        id: number;
        name: string;
    } | null;
    category: {
        id: number;
        name: string;
    } | null;
    image_url: string | null;
    min_price: number | null;
    max_price: number | null;
    created_at: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createProductColumns = (
    t: (key: string) => string,
    onDelete: (product: Product) => void,
    onToggleStatus: (product: Product, enabled: boolean) => void,
    isDeleting: boolean
): ColumnDef<Product>[] => [
    {
        id: "select",
        header: ({table}) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    aria-label="Select all"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                    }}
                />
            </div>
        ),
        cell: ({row}) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    aria-label="Select row"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "image",
        header: "",
        size: 48,
        cell: ({row}) => {
            const product = row.original

            const handleClick = () => {
                router.visit(`/admin/products/${product.id}/edit`)
            }

            return (
                <div
                    className="w-12 cursor-pointer"
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleClick()
                        }
                    }}
                >
                    {product.image_url ? (
                        <img
                            alt={product.title}
                            className="size-12 rounded-md border object-cover transition-opacity hover:opacity-80"
                            src={product.image_url}
                        />
                    ) : (
                        <div
                            className="flex size-12 items-center justify-center rounded-md border bg-muted transition-opacity hover:opacity-80">
                            <ImageIcon className="size-6 text-muted-foreground"/>
                        </div>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: "title",
        header: t('admin.products_table.columns.title'),
        cell: ({row}) => {
            const product = row.original

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{product.title}</span>
                    {!!product.category &&
                        <span className="text-sm text-muted-foreground">{product.category.name}</span>}
                </div>
            )
        },
        filterFn: (row, _id, value) => {
            const product = row.original
            const title = product.title.toLowerCase()
            const searchValue = value.toLowerCase()

            return title.includes(searchValue)
        },
        enableHiding: false,
    },
    {
        id: "price",
        header: t('admin.products_table.columns.price'),
        cell: ({row}) => {
            const product = row.original
            const minPrice = product.min_price
            const maxPrice = product.max_price

            if (minPrice === null || maxPrice === null) {
                return <span className="text-muted-foreground">—</span>
            }

            if (minPrice === maxPrice) {
                return <span className="font-medium">{toMoneyFormat(minPrice)}</span>
            }

            return (
                <span className="font-medium">
          {toMoneyFormat(minPrice)} — {toMoneyFormat(maxPrice)}
        </span>
            )
        },
    },
    {
        accessorKey: "enabled",
        header: t('admin.products_table.columns.status'),
        cell: ({row}) => {
            const product = row.original

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={product.enabled}
                        onCheckedChange={(checked) => {
                            onToggleStatus(product, checked);
                        }}
                    />
                    <Badge
                        className={product.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }
                        variant="outline"
                    >
                        {product.enabled ? t('admin.products_table.status.enabled') : t('admin.products_table.status.disabled')}
                    </Badge>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const rowValue = row.getValue(id)

            if (value === "all") {
                return true
            }
            if (value === "enabled") {
                return rowValue === true
            }
            if (value === "disabled") {
                return rowValue === false
            }

            return true
        },
    },

    {
        accessorKey: "created_at",
        header: t('admin.products_table.columns.created'),
        cell: ({row}) => {
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
            const product = row.original

            const handleEdit = () => {
                router.visit(`/admin/products/${product.id}/edit`)
            }

            const handleDelete = () => {
                // eslint-disable-next-line no-alert
                if (!confirm(`${t('admin.products_table.confirm.delete_one')} ${product.title}?`)) {
                    return
                }

                onDelete(product)
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
                                <span className="sr-only">{t('admin.products_table.actions.open_menu')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                                onClick={handleEdit}>{t('admin.products_table.actions.edit')}</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                {t('admin.products_table.actions.delete')}
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

// Bulk Actions Select Component
interface BulkStatusSelectProps {
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    t: (key: string) => string;
}

function BulkStatusSelect({selectedStatus, setSelectedStatus, t}: BulkStatusSelectProps) {
    return (
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue placeholder={t('admin.products_table.bulk.change_status')}/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="enabled">{t('admin.products_table.status.enabled')}</SelectItem>
                <SelectItem value="disabled">{t('admin.products_table.status.disabled')}</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default function Products() {
    const {t} = useLang();
    const {products} = usePage<{ products: Product[] }>().props;

    // State for operations
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [selectedStatus, setSelectedStatus] = React.useState<string>("")
    const [priceMin, setPriceMin] = React.useState<string>("")
    const [priceMax, setPriceMax] = React.useState<string>("")

    // Delete single product
    const handleDelete = React.useCallback((product: Product) => {
        setIsDeleting(true);

        router.delete(route('admin.products.destroy', {product: product.id}), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.products_table.success.deleted'));
            },
            onError: () => {
                toast.error(t('admin.products_table.errors.delete_failed'));
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [t]);

    // Toggle product status
    const handleToggleStatus = React.useCallback((product: Product, enabled: boolean) => {
        router.post(route('admin.products.bulk-update-status'), {
            product_ids: [product.id],
            enabled,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.products_table.success.status_updated'));
            },
            onError: () => {
                toast.error(t('admin.products_table.errors.status_update_failed'));
            },
        });
    }, [t]);

    // Bulk actions slot renderer
    const renderBulkActionsSlot = React.useCallback(() => (
        <BulkStatusSelect
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            t={t}
        />
    ), [selectedStatus, t]);

    // ============================================
    // COLUMNS
    // ============================================

    const columns = React.useMemo(
        () => createProductColumns(t, handleDelete, handleToggleStatus, isDeleting),
        [t, handleDelete, handleToggleStatus, isDeleting]
    );

    // ============================================
    // BULK ACTIONS
    // ============================================

    const bulkActions: BulkAction<Product>[] = React.useMemo(() => [
        // Bulk Status Change
        {
            id: "change-status",
            label: t('admin.products_table.bulk.update_status'),
            icon: PackageIcon,
            variant: "outline",
            disabled: () => !selectedStatus,
            action: async (selectedProducts: Product[]) => {
                const productIds = selectedProducts.map(p => p.id)

                router.post(route('admin.products.bulk-update-status'), {
                    product_ids: productIds,
                    enabled: selectedStatus === "enabled"
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('admin.products_table.success.status_updated'));
                        setSelectedStatus("");
                    },
                    onError: () => {
                        toast.error(t('admin.products_table.errors.status_update_failed'));
                    },
                });
            },
        },
        // Bulk Delete
        {
            id: "delete",
            label: t('admin.products_table.bulk.delete_selected'),
            icon: Trash2Icon,
            variant: "destructive",
            confirmMessage: (selectedProducts: Product[]) =>
                `${t('admin.products_table.confirm.delete_many')} ${selectedProducts.length} ${t('admin.products_table.confirm.products')}`,
            action: async (selectedProducts: Product[]) => {
                const productIds = selectedProducts.map(p => p.id)

                router.post(route('admin.products.bulk-delete'), {
                    product_ids: productIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('admin.products_table.success.bulk_deleted'));
                    },
                    onError: () => {
                        toast.error(t('admin.products_table.errors.bulk_delete_failed'));
                    },
                });
            },
        },
    ], [t, selectedStatus]);

    // ============================================
    // FILTERED DATA
    // ============================================

    const filteredProducts = React.useMemo(() => {
        let result = products ?? []

        const minPrice = priceMin ? parseFloat(priceMin) : null
        const maxPrice = priceMax ? parseFloat(priceMax) : null

        if (minPrice !== null || maxPrice !== null) {
            result = result.filter((product) => {
                const productMinPrice = product.min_price
                const productMaxPrice = product.max_price

                // Skip products without prices
                if (productMinPrice === null && productMaxPrice === null) {
                    return false
                }

                // Check min price filter (product's max price should be >= filter min)
                if (minPrice !== null && productMaxPrice !== null && productMaxPrice < minPrice) {
                    return false
                }

                // Check max price filter (product's min price should be <= filter max)
                if (maxPrice !== null && productMinPrice !== null && productMinPrice > maxPrice) {
                    return false
                }

                return true
            })
        }

        return result
    }, [products, priceMin, priceMax])

    // ============================================
    // FILTERS
    // ============================================

    const filters: Filter[] = React.useMemo(() => [
        // Search filter
        {
            type: "search",
            columnId: "title",
            placeholder: t('admin.products_table.filters.search_placeholder'),
        },
        // Status filter
        {
            type: "custom",
            columnId: "enabled",
            render: ({value, onChange}) => (
                <Select
                    value={value || "all"}
                    onValueChange={(newValue) => {
                        onChange(newValue === "all" ? "" : newValue);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder={t('admin.products_table.filters.all_statuses')}/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('admin.products_table.filters.all_statuses')}</SelectItem>
                        <SelectItem value="enabled">{t('admin.products_table.status.enabled')}</SelectItem>
                        <SelectItem value="disabled">{t('admin.products_table.status.disabled')}</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
        // Price range filter
        {
            type: "custom",
            columnId: "price",
            render: () => (
                <div className="flex items-center gap-2">
                    <Input
                        className="h-9 w-24"
                        min="0"
                        placeholder={t('admin.products_table.filters.price_from')}
                        step="0.01"
                        type="number"
                        value={priceMin}
                        onChange={(e) => {
                            setPriceMin(e.target.value);
                        }}
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                        className="h-9 w-24"
                        min="0"
                        placeholder={t('admin.products_table.filters.price_to')}
                        step="0.01"
                        type="number"
                        value={priceMax}
                        onChange={(e) => {
                            setPriceMax(e.target.value);
                        }}
                    />
                </div>
            ),
        },
    ], [t, priceMin, priceMax]);

    // ============================================
    // TRANSLATIONS
    // ============================================

    const translations: ResourceListTranslations = React.useMemo(() => ({
        empty: t('admin.products_table.empty'),
        selected: t('admin.products_table.bulk.selected'),
        rowsSelected: t('admin.products_table.pagination.rows_selected'),
        row: t('admin.products_table.pagination.row'),
        rowsPerPage: t('admin.products_table.pagination.rows_per_page'),
        page: t('admin.products_table.pagination.page'),
        of: t('admin.products_table.pagination.of'),
        goFirst: t('admin.products_table.pagination.go_first'),
        goPrevious: t('admin.products_table.pagination.go_previous'),
        goNext: t('admin.products_table.pagination.go_next'),
        goLast: t('admin.products_table.pagination.go_last'),
        columns: t('admin.products_table.filters.columns'),
        clearSelection: t('admin.products_table.bulk.clear_selection'),
    }), [t]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <AdminLayout title={t('admin.products.title')}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.products.title')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('admin.products.description')}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            router.visit('/admin/products/create');
                        }}
                    >
                        <PlusIcon className="size-4"/>
                        {t('admin.products.actions.create')}
                    </Button>
                </div>

                <ResourceList
                    bulkActions={bulkActions}
                    bulkActionsSlot={renderBulkActionsSlot}
                    columns={columns}
                    data={filteredProducts}
                    filters={filters}
                    getRowId={(row) => row.id.toString()}
                    translations={translations}
                />
            </div>
        </AdminLayout>
    );
}
