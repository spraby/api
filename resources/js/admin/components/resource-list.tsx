import * as React from "react"

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type {
  BulkAction,
  BulkActionState,
  ResourceListProps,
  SearchFilter,
  SelectFilter,
} from "@/types/resource-list"

import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  VisibilityState} from "@tanstack/react-table";

/**
 * Universal ResourceList Component
 *
 * A reusable, type-safe table component with built-in features:
 * - Row selection with checkboxes
 * - Sorting, filtering, pagination
 * - Bulk actions on selected rows
 * - Column visibility toggle
 * - Responsive design with dark mode support
 * - Full i18n support
 *
 * @example
 * ```tsx
 * <ResourceList
 *   data={users}
 *   columns={userColumns}
 *   getRowId={(row) => row.id.toString()}
 *   translations={translations}
 *   bulkActions={bulkActions}
 *   filters={filters}
 * />
 * ```
 */
export function ResourceList<TData>({
  data,
  columns,
  getRowId,
  translations,
  bulkActions = [],
  filters = [],
  emptyMessage,
  defaultPageSize = 10,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enablePagination = true,
  enableSorting = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  loading = false,
  renderEmpty,
  onRowSelectionChange,
  bulkActionsSlot,
  paginationState,
  onPaginationStateChange,
  manualPagination = false,
  pageCount,
  rowCount,
  initialFilters,
  onFiltersChange,
}: ResourceListProps<TData>) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const buildColumnFilters = React.useCallback((values?: Record<string, string>) => {
    if (!values) {
      return [] as ColumnFiltersState;
    }

    return Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
      .map(([id, value]) => ({ id, value }));
  }, []);

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => buildColumnFilters(initialFilters))
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [bulkActionState, setBulkActionState] = React.useState<BulkActionState>({
    executingActionId: null,
    isExecuting: false,
  })

  // ============================================
  // TABLE CONFIGURATION
  // ============================================

  const effectivePagination = paginationState ?? pagination
  const handlePaginationChange: OnChangeFn<PaginationState> = onPaginationStateChange ?? setPagination

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : undefined,
      columnFilters,
      pagination: enablePagination ? effectivePagination : undefined,
    },
    getRowId,
    enableRowSelection,
    enableSorting,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: enablePagination ? handlePaginationChange : undefined,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedData = React.useMemo(
    () => selectedRows.map((row) => row.original),
    [selectedRows]
  )

  // ============================================
  // EFFECTS
  // ============================================

  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(selectedData)
    }
  }, [selectedData, onRowSelectionChange])

  React.useEffect(() => {
    if (!initialFilters) {
      return;
    }

    const nextFilters = buildColumnFilters(initialFilters);
    const isSame = nextFilters.length === columnFilters.length
      && nextFilters.every((nextFilter, index) => {
        const current = columnFilters[index];
        return current?.id === nextFilter.id && current?.value === nextFilter.value;
      });

    if (!isSame) {
      setColumnFilters(nextFilters);
    }
  }, [initialFilters, buildColumnFilters, columnFilters]);

  const filtersChangeRef = React.useRef<Record<string, string>>({});
  const skipFiltersChangeRef = React.useRef(true);

  React.useEffect(() => {
    if (!onFiltersChange) {
      return;
    }

    const nextFilters = columnFilters.reduce<Record<string, string>>((acc, filter) => {
      if (filter.value !== undefined && filter.value !== null && String(filter.value).length > 0) {
        acc[filter.id] = String(filter.value);
      }
      return acc;
    }, {});

    const allKeys = new Set([
      ...Object.keys(filtersChangeRef.current),
      ...Object.keys(nextFilters),
    ]);
    const isSame = Array.from(allKeys).every((key) =>
      (filtersChangeRef.current[key] ?? "") === (nextFilters[key] ?? "")
    );

    if (skipFiltersChangeRef.current) {
      skipFiltersChangeRef.current = false;
      filtersChangeRef.current = nextFilters;
      return;
    }

    if (isSame) {
      return;
    }

    filtersChangeRef.current = nextFilters;
    onFiltersChange(nextFilters);
  }, [columnFilters, onFiltersChange]);

  // ============================================
  // BULK ACTION HANDLERS
  // ============================================

  const handleBulkAction = React.useCallback(
    async (action: BulkAction<TData>) => {
      if (!selectedData.length) {return}
      if (action.disabled?.(selectedData)) {return}

      // Show confirmation if required
      if (action.confirmMessage) {
        const message =
          typeof action.confirmMessage === "function"
            ? action.confirmMessage(selectedData)
            : action.confirmMessage

        // eslint-disable-next-line no-alert
        if (!confirm(message)) {
          return
        }
      }

      // Set loading state
      setBulkActionState({
        executingActionId: action.id,
        isExecuting: true,
      })

      try {
        await action.action(selectedData)

        // Clear selection on success
        setRowSelection({})
      } catch (error) {
        console.error("Bulk action failed:", error)
        toast.error("Action failed. Please try again.")
      } finally {
        setBulkActionState({
          executingActionId: null,
          isExecuting: false,
        })
      }
    },
    [selectedData]
  )

  const clearSelection = React.useCallback(() => {
    setRowSelection({})
  }, [])

  // ============================================
  // FILTER RENDERERS
  // ============================================

  const renderSearchFilter = React.useCallback(
    (filter: SearchFilter) => {
      const Icon = filter.icon || SearchIcon

      return (
        <div key={filter.columnId} className="relative flex-1 sm:max-w-sm">
          <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className={cn("pl-9", filter.className)}
            placeholder={filter.placeholder}
            value={(table.getColumn(filter.columnId)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filter.columnId)?.setFilterValue(event.target.value)
            }
          />
        </div>
      )
    },
    [table]
  )

  const renderSelectFilter = React.useCallback(
    (filter: SelectFilter) => {
      return (
        <Select
          key={filter.columnId}
          value={(table.getColumn(filter.columnId)?.getFilterValue() as string) ?? filter.defaultValue ?? ""}
          onValueChange={(value) => {
            const column = table.getColumn(filter.columnId)

            if (value === filter.defaultValue) {
              column?.setFilterValue("")
            } else {
              column?.setFilterValue(value)
            }
          }}
        >
          <SelectTrigger className={cn("w-full sm:w-40", filter.className)}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    [table]
  )

  const renderCustomFilter = React.useCallback(
    (filter: { type: "custom"; columnId: string; render: (props: { value: string; onChange: (value: string) => void }) => React.ReactNode }) => {
      const column = table.getColumn(filter.columnId)
      const value = (column?.getFilterValue() as string) ?? ""
      const onChange = (newValue: string) => column?.setFilterValue(newValue)

      return (
        <div key={filter.columnId}>
          {filter.render({ value, onChange })}
        </div>
      )
    },
    [table]
  )

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* Bulk Actions Bar */}
      {!!enableRowSelection && selectedRows.length > 0 && !!(bulkActions.length > 0 || bulkActionsSlot) && (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedRows.length} {translations.selected}
              </span>
              <Button
                className="h-8 px-2"
                size="sm"
                variant="ghost"
                onClick={clearSelection}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            {!!bulkActionsSlot && <>
                <div className="hidden h-4 w-px bg-border sm:block" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {bulkActionsSlot(selectedData)}
                </div>
              </>}
          </div>

          {bulkActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {bulkActions.map((action) => {
                const Icon = action.icon
                const isDisabled =
                  action.disabled?.(selectedData) ||
                  (bulkActionState.isExecuting &&
                    bulkActionState.executingActionId !== action.id)
                const isLoading =
                  bulkActionState.isExecuting &&
                  bulkActionState.executingActionId === action.id

                return (
                  <Button
                    key={action.id}
                    className={cn("h-9", action.className)}
                    disabled={isDisabled || isLoading}
                    size={action.size || "sm"}
                    variant={action.variant || "outline"}
                    onClick={async () => handleBulkAction(action)}
                  >
                    {!!Icon && <Icon className="size-4" />}
                    <span>{action.label}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters Bar */}
      {filters.length > 0 || enableColumnVisibility ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center sm:gap-2">
            {filters.map((filter) => {
              if (filter.type === "search") {
                return renderSearchFilter(filter)
              } if (filter.type === "select") {
                return renderSelectFilter(filter)
              } if (filter.type === "custom") {
                return renderCustomFilter(filter)
              }

              return null
            })}
          </div>

          {!!enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto" size="sm" variant="outline">
                  <ColumnsIcon />
                  <span>{translations.columns}</span>
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" && column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        className="capitalize"
                        onCheckedChange={(value) => { column.toggleVisibility(!!value); }}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {(() => {
                if (loading) {
                  return (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={columns.length}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  );
                }

                const { rows } = table.getRowModel();

                if (rows?.length) {
                  return rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ));
                }

                return (
                  <TableRow>
                    <TableCell className="h-24 text-center" colSpan={columns.length}>
                      {renderEmpty ? renderEmpty() : emptyMessage ?? translations.empty}
                    </TableCell>
                  </TableRow>
                );
              })()}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!!enablePagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length}{" "}
            {translations.rowsSelected} {rowCount ?? table.getFilteredRowModel().rows.length}{" "}
            {translations.row}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <Label
                className="whitespace-nowrap text-sm font-medium"
                htmlFor="rows-per-page"
              >
                {translations.rowsPerPage}
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-center">
              <div className="flex w-fit items-center justify-center text-sm font-medium sm:min-w-24">
                {translations.page} {table.getState().pagination.pageIndex + 1}{" "}
                {translations.of} {table.getPageCount()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="hidden size-8 lg:flex"
                  disabled={!table.getCanPreviousPage()}
                  size="icon"
                  variant="outline"
                  onClick={() => { table.setPageIndex(0); }}
                >
                  <span className="sr-only">{translations.goFirst}</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  className="size-8"
                  disabled={!table.getCanPreviousPage()}
                  size="icon"
                  variant="outline"
                  onClick={() => { table.previousPage(); }}
                >
                  <span className="sr-only">{translations.goPrevious}</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  className="size-8"
                  disabled={!table.getCanNextPage()}
                  size="icon"
                  variant="outline"
                  onClick={() => { table.nextPage(); }}
                >
                  <span className="sr-only">{translations.goNext}</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  className="hidden size-8 lg:flex"
                  disabled={!table.getCanNextPage()}
                  size="icon"
                  variant="outline"
                  onClick={() => { table.setPageIndex(table.getPageCount() - 1); }}
                >
                  <span className="sr-only">{translations.goLast}</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
