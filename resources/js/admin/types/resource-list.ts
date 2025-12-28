import { ColumnDef } from "@tanstack/react-table"
import { LucideIcon } from "lucide-react"
import * as React from "react"

/**
 * Translations interface for ResourceList component
 * All text labels used in the component should be provided through this interface
 */
export interface ResourceListTranslations {
  // Table
  empty: string

  // Selection
  selected: string
  rowsSelected: string
  row: string

  // Pagination
  rowsPerPage: string
  page: string
  of: string
  goFirst: string
  goPrevious: string
  goNext: string
  goLast: string

  // Column visibility
  columns: string

  // Bulk actions
  clearSelection?: string
}

/**
 * Bulk action definition
 * Describes an action that can be performed on multiple selected rows
 */
export interface BulkAction<TData> {
  /** Unique identifier for the action */
  id: string

  /** Display label for the action */
  label: string

  /** Icon component from lucide-react */
  icon?: LucideIcon

  /** Button variant - affects styling */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

  /** Function to execute when action is triggered */
  action: (selectedRows: TData[]) => void | Promise<void>

  /** Optional confirmation message before executing action */
  confirmMessage?: string | ((selectedRows: TData[]) => string)

  /** Optional function to determine if action should be disabled */
  disabled?: (selectedRows: TData[]) => boolean

  /** Whether to show loading state during execution */
  loading?: boolean

  /** Size of the button */
  size?: "default" | "sm" | "lg" | "icon"

  /** Additional CSS classes */
  className?: string
}

/**
 * Filter type definitions
 */
export type FilterType = "search" | "select" | "custom"

/**
 * Base filter interface
 */
export interface BaseFilter {
  /** Column ID to filter */
  columnId: string

  /** Filter type */
  type: FilterType

  /** Optional CSS classes */
  className?: string
}

/**
 * Search filter - renders an input field with search icon
 */
export interface SearchFilter extends BaseFilter {
  type: "search"

  /** Placeholder text for the input */
  placeholder: string

  /** Optional icon (defaults to SearchIcon) */
  icon?: LucideIcon
}

/**
 * Select filter - renders a dropdown with predefined options
 */
export interface SelectFilter extends BaseFilter {
  type: "select"

  /** Placeholder text for the select */
  placeholder: string

  /** Available options */
  options: Array<{
    label: string
    value: string
  }>

  /** Default value */
  defaultValue?: string
}

/**
 * Custom filter - renders a custom React component
 */
export interface CustomFilter extends BaseFilter {
  type: "custom"

  /** Custom render function */
  render: (props: {
    value: string
    onChange: (value: string) => void
  }) => React.ReactNode
}

/**
 * Union type for all filter types
 */
export type Filter = SearchFilter | SelectFilter | CustomFilter

/**
 * Main ResourceList component props
 */
export interface ResourceListProps<TData> {
  // ============================================
  // REQUIRED PROPS
  // ============================================

  /** Data array to display in the table */
  data: TData[]

  /** Column definitions for the table */
  columns: ColumnDef<TData>[]

  /** Function to get unique ID for each row */
  getRowId: (row: TData) => string

  /** Translations for UI labels */
  translations: ResourceListTranslations

  // ============================================
  // OPTIONAL PROPS
  // ============================================

  /** Bulk actions to display when rows are selected */
  bulkActions?: BulkAction<TData>[]

  /** Filters to display above the table */
  filters?: Filter[]

  /** Message to display when table is empty */
  emptyMessage?: string

  /** Default page size (default: 10) */
  defaultPageSize?: number

  /** Enable row selection with checkboxes (default: true) */
  enableRowSelection?: boolean

  /** Enable column visibility toggle (default: true) */
  enableColumnVisibility?: boolean

  /** Enable pagination (default: true) */
  enablePagination?: boolean

  /** Enable sorting (default: true) */
  enableSorting?: boolean

  /** Available page size options (default: [10, 20, 30, 40, 50]) */
  pageSizeOptions?: number[]

  /** Additional CSS classes for the root container */
  className?: string

  /** Loading state */
  loading?: boolean

  /** Custom empty state component */
  renderEmpty?: () => React.ReactNode

  /** Callback when row selection changes */
  onRowSelectionChange?: (selectedRows: TData[]) => void

  /** Custom slot to render before bulk actions (e.g., for role selector) */
  bulkActionsSlot?: (selectedRows: TData[]) => React.ReactNode
}

/**
 * Internal state for bulk action execution
 */
export interface BulkActionState {
  /** ID of the currently executing action */
  executingActionId: string | null

  /** Whether the action is currently executing */
  isExecuting: boolean
}
