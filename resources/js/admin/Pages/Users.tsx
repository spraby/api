import { router } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table"
import { MoreVerticalIcon, Trash2Icon, UserCogIcon } from "lucide-react"
import * as React from "react"

import { ResourceList } from '@/components/resource-list';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers } from '@/lib/hooks/api/useUsers';
import { useBulkDeleteUsers, useBulkUpdateUserRoles, useDeleteUser } from '@/lib/hooks/mutations/useUserMutations';
import { useLang } from '@/lib/lang';
import type { User } from '@/types/api';
import { BulkAction, Filter, ResourceListTranslations } from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createUserColumns = (
  __: (key: string) => string,
  deleteUser: ReturnType<typeof useDeleteUser>
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: __('admin.users_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: __('admin.users_table.columns.name'),
    cell: ({ row }) => {
      const user = row.original
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ")
      return (
        <div className="flex flex-col">
          <span className="font-medium">{fullName || "—"}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const user = row.original
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").toLowerCase()
      const email = user.email.toLowerCase()
      const searchValue = value.toLowerCase()

      return fullName.includes(searchValue) || email.includes(searchValue)
    },
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: __('admin.users_table.columns.role'),
    cell: ({ row }) => {
      const role = row.getValue("role") as string | null

      const roleColors: Record<string, string> = {
        admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      }

      if (!role) {
        return <Badge variant="outline" className="text-muted-foreground">{__('admin.users_table.roles.user')}</Badge>
      }

      const roleKey = role.toLowerCase();
      const roleLabel = roleKey === 'admin'
        ? __('admin.users_table.roles.admin')
        : roleKey === 'manager'
        ? __('admin.users_table.roles.manager')
        : role;

      return (
        <Badge
          variant="outline"
          className={roleColors[roleKey] || ""}
        >
          {roleLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string | null
      if (value === "all") return true
      if (value === "user" && !rowValue) return true
      return rowValue?.toLowerCase() === value
    },
  },
  {
    accessorKey: "created_at",
    header: __('admin.users_table.columns.created'),
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
      const user = row.original

      const handleEdit = () => {
        router.visit(`/sb/admin/users/${user.id}/edit`)
      }

      const handleDelete = () => {
        // eslint-disable-next-line no-alert
        if (!confirm(`${__('admin.users_table.confirm.delete_one')} ${user.first_name || user.email}?`)) {
          return
        }

        deleteUser.mutate(user.id);
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                disabled={deleteUser.isPending}
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">{__('admin.users_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEdit}>{__('admin.users_table.actions.edit')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                {__('admin.users_table.actions.delete')}
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

export default function Users() {
  const { __ } = useLang();

  // API Hooks
  const { data: users, isLoading, error } = useUsers();
  const bulkDelete = useBulkDeleteUsers();
  const bulkUpdateRoles = useBulkUpdateUserRoles();
  const deleteUser = useDeleteUser();

  // State for bulk role change
  const [selectedRole, setSelectedRole] = React.useState<string>("")

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createUserColumns(__, deleteUser),
    [__, deleteUser]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<User>[] = React.useMemo(() => [
    // Bulk Role Change
    {
      id: "change-role",
      label: __('admin.users_table.bulk.update_role'),
      icon: UserCogIcon,
      variant: "outline",
      disabled: () => !selectedRole,
      action: async (selectedUsers: User[]) => {
        const userIds = selectedUsers.map(u => u.id)

        bulkUpdateRoles.mutate({
          user_ids: userIds,
          role: selectedRole
        }, {
          onSuccess: () => {
            setSelectedRole("")
          }
        });
      },
    },
    // Bulk Delete
    {
      id: "delete",
      label: __('admin.users_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedUsers: User[]) =>
        `${__('admin.users_table.confirm.delete_many')} ${selectedUsers.length} ${__('admin.users_table.confirm.users')}`,
      action: async (selectedUsers: User[]) => {
        const userIds = selectedUsers.map(u => u.id)
        bulkDelete.mutate({ user_ids: userIds });
      },
    },
  ], [__, selectedRole, bulkDelete, bulkUpdateRoles]);

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "name",
      placeholder: __('admin.users_table.filters.search_placeholder'),
    },
    // Role filter with custom render for the dropdown
    {
      type: "custom",
      columnId: "role",
      render: ({ value, onChange }) => (
        <Select
          value={value || "all"}
          onValueChange={(newValue) => onChange(newValue === "all" ? "" : newValue)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={__('admin.users_table.filters.all_roles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{__('admin.users_table.filters.all_roles')}</SelectItem>
            <SelectItem value="admin">{__('admin.users_table.roles.admin')}</SelectItem>
            <SelectItem value="manager">{__('admin.users_table.roles.manager')}</SelectItem>
            <SelectItem value="user">{__('admin.users_table.roles.user')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [__]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: __('admin.users_table.empty'),
    selected: __('admin.users_table.bulk.selected'),
    rowsSelected: __('admin.users_table.pagination.rows_selected'),
    row: __('admin.users_table.pagination.row'),
    rowsPerPage: __('admin.users_table.pagination.rows_per_page'),
    page: __('admin.users_table.pagination.page'),
    of: __('admin.users_table.pagination.of'),
    goFirst: __('admin.users_table.pagination.go_first'),
    goPrevious: __('admin.users_table.pagination.go_previous'),
    goNext: __('admin.users_table.pagination.go_next'),
    goLast: __('admin.users_table.pagination.go_last'),
    columns: __('admin.users_table.filters.columns'),
    clearSelection: __('admin.users_table.bulk.clear_selection'),
  }), [__]);

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (isLoading) {
    return (
      <AdminLayout title={__('admin.users.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={__('admin.users.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <AdminLayout title={__('admin.users.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{__('admin.users.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {__('admin.users.description')}
            </p>
          </div>
        </div>

        <ResourceList
          data={users || []}
          columns={columns}
          getRowId={(row) => row.id.toString()}
          translations={translations}
          bulkActions={bulkActions}
          filters={filters}
          bulkActionsSlot={() => (
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue placeholder={__('admin.users_table.bulk.change_role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{__('admin.users_table.roles.admin')}</SelectItem>
                <SelectItem value="manager">{__('admin.users_table.roles.manager')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </AdminLayout>
  );
}
