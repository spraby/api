import * as React from "react"

import { router } from '@inertiajs/react';
import { MoreVerticalIcon, Trash2Icon, UserCogIcon } from "lucide-react"

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
import type { BulkAction, Filter, ResourceListTranslations } from '@/types/resource-list';

import AdminLayout from '../layouts/AdminLayout.tsx';

import type { ColumnDef } from "@tanstack/react-table"

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createUserColumns = (
  t: (key: string) => string,
  deleteUser: ReturnType<typeof useDeleteUser>
): ColumnDef<User>[] => [
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
    header: t('admin.users_table.columns.id'),
    cell: ({ row }) => (
      <div className="w-16 font-medium text-muted-foreground">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: t('admin.users_table.columns.name'),
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
    header: t('admin.users_table.columns.role'),
    cell: ({ row }) => {
      const role = row.getValue("role")

      const roleColors: Record<string, string> = {
        admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      }

      if (!role) {
        return <Badge className="text-muted-foreground" variant="outline">{t('admin.users_table.roles.user')}</Badge>
      }

      const roleKey = role.toLowerCase();
      let roleLabel = role;

      if (roleKey === 'admin') {
        roleLabel = t('admin.users_table.roles.admin');
      } else if (roleKey === 'manager') {
        roleLabel = t('admin.users_table.roles.manager');
      }

      return (
        <Badge
          className={roleColors[roleKey] ?? ""}
          variant="outline"
        >
          {roleLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id)

      if (value === "all") {return true}
      if (value === "user" && !rowValue) {return true}

      return rowValue?.toLowerCase() === value
    },
  },
  {
    accessorKey: "created_at",
    header: t('admin.users_table.columns.created'),
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
        if (!confirm(`${t('admin.users_table.confirm.delete_one')} ${user.first_name || user.email}?`)) {
          return
        }

        deleteUser.mutate(user.id);
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                disabled={deleteUser.isPending}
                size="icon"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">{t('admin.users_table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEdit}>{t('admin.users_table.actions.edit')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                {t('admin.users_table.actions.delete')}
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
interface BulkRoleSelectProps {
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  t: (key: string) => string;
}

function BulkRoleSelect({ selectedRole, setSelectedRole, t }: BulkRoleSelectProps) {
  return (
    <Select value={selectedRole} onValueChange={setSelectedRole}>
      <SelectTrigger className="h-9 w-full sm:w-40">
        <SelectValue placeholder={t('admin.users_table.bulk.change_role')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">{t('admin.users_table.roles.admin')}</SelectItem>
        <SelectItem value="manager">{t('admin.users_table.roles.manager')}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function Users() {
  const { t } = useLang();

  // API Hooks
  const { data: users, isLoading, error } = useUsers();
  const bulkDelete = useBulkDeleteUsers();
  const bulkUpdateRoles = useBulkUpdateUserRoles();
  const deleteUser = useDeleteUser();

  // State for bulk role change
  const [selectedRole, setSelectedRole] = React.useState<string>("")

  // Bulk actions slot renderer
  const renderBulkActionsSlot = React.useCallback(() => (
    <BulkRoleSelect
      selectedRole={selectedRole}
      setSelectedRole={setSelectedRole}
      t={t}
    />
  ), [selectedRole, t]);

  // ============================================
  // COLUMNS
  // ============================================

  const columns = React.useMemo(
    () => createUserColumns(t, deleteUser),
    [t, deleteUser]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const bulkActions: BulkAction<User>[] = React.useMemo(() => [
    // Bulk Role Change
    {
      id: "change-role",
      label: t('admin.users_table.bulk.update_role'),
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
      label: t('admin.users_table.bulk.delete_selected'),
      icon: Trash2Icon,
      variant: "destructive",
      confirmMessage: (selectedUsers: User[]) =>
        `${t('admin.users_table.confirm.delete_many')} ${selectedUsers.length} ${t('admin.users_table.confirm.users')}`,
      action: async (selectedUsers: User[]) => {
        const userIds = selectedUsers.map(u => u.id)

        bulkDelete.mutate({ user_ids: userIds });
      },
    },
  ], [t, selectedRole, bulkDelete, bulkUpdateRoles]);

  // ============================================
  // FILTERS
  // ============================================

  const filters: Filter[] = React.useMemo(() => [
    // Search filter
    {
      type: "search",
      columnId: "name",
      placeholder: t('admin.users_table.filters.search_placeholder'),
    },
    // Role filter with custom render for the dropdown
    {
      type: "custom",
      columnId: "role",
      render: ({ value, onChange }) => (
        <Select
          value={value || "all"}
          onValueChange={(newValue) => { onChange(newValue === "all" ? "" : newValue); }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('admin.users_table.filters.all_roles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.users_table.filters.all_roles')}</SelectItem>
            <SelectItem value="admin">{t('admin.users_table.roles.admin')}</SelectItem>
            <SelectItem value="manager">{t('admin.users_table.roles.manager')}</SelectItem>
            <SelectItem value="user">{t('admin.users_table.roles.user')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [t]);

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translations: ResourceListTranslations = React.useMemo(() => ({
    empty: t('admin.users_table.empty'),
    selected: t('admin.users_table.bulk.selected'),
    rowsSelected: t('admin.users_table.pagination.rows_selected'),
    row: t('admin.users_table.pagination.row'),
    rowsPerPage: t('admin.users_table.pagination.rows_per_page'),
    page: t('admin.users_table.pagination.page'),
    of: t('admin.users_table.pagination.of'),
    goFirst: t('admin.users_table.pagination.go_first'),
    goPrevious: t('admin.users_table.pagination.go_previous'),
    goNext: t('admin.users_table.pagination.go_next'),
    goLast: t('admin.users_table.pagination.go_last'),
    columns: t('admin.users_table.filters.columns'),
    clearSelection: t('admin.users_table.bulk.clear_selection'),
  }), [t]);

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (isLoading) {
    return (
      <AdminLayout title={t('admin.users.title')}>
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
      <AdminLayout title={t('admin.users.title')}>
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
    <AdminLayout title={t('admin.users.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('admin.users.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.users.description')}
            </p>
          </div>
        </div>

        <ResourceList
          bulkActions={bulkActions}
          bulkActionsSlot={renderBulkActionsSlot}
          columns={columns}
          data={users ?? []}
          filters={filters}
          getRowId={(row) => row.id.toString()}
          translations={translations}
        />
      </div>
    </AdminLayout>
  );
}
