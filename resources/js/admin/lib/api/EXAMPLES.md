# Примеры использования API сервиса

Этот документ содержит практические примеры использования API сервиса, построенного на **TanStack Query v5** и **нативном Fetch API с Inertia.js CSRF интеграцией**.

> **Технологии:**
> - TanStack Query (React Query) - управление серверным состоянием
> - Native Fetch API - HTTP запросы
> - Inertia.js - автоматическая обработка CSRF токенов
> - TypeScript - полная типизация

## 🎯 Базовый пример: Список пользователей с загрузкой

```tsx
import { useUsers } from '@/lib/hooks/api/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UsersExample() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {users?.map(user => (
        <div key={user.id} className="p-4 border rounded-lg">
          <div className="font-medium">{user.email}</div>
          <div className="text-sm text-muted-foreground">
            {user.first_name} {user.last_name}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Пример: Обновление пользователя с формой

```tsx
import { useUser } from '@/lib/hooks/api/useUsers';
import { useUpdateUser } from '@/lib/hooks/mutations/useUserMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function UserEditExample({ userId }: { userId: number }) {
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        email: user.email,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateUser.mutate(
      { id: userId, data: formData },
      {
        onSuccess: () => {
          console.log('User updated!');
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={formData.first_name}
        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        placeholder="First name"
      />
      <Input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        type="email"
      />
      <Button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

## 🗑️ Пример: Удаление пользователя с подтверждением

```tsx
import { useDeleteUser } from '@/lib/hooks/mutations/useUserMutations';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DeleteUserExample({ userId, userName }: { userId: number; userName: string }) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        console.log('User deleted successfully');
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={deleteUser.isPending}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete user "{userName}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {deleteUser.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## 📦 Пример: Массовое удаление с выбором

```tsx
import { useState } from 'react';
import { useBulkDeleteUsers } from '@/lib/hooks/mutations/useUserMutations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function BulkDeleteExample({ users }: { users: User[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const bulkDelete = useBulkDeleteUsers();

  const handleToggle = (userId: number) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Delete ${selectedIds.length} users?`)) {
      bulkDelete.mutate(
        { user_ids: selectedIds },
        {
          onSuccess: () => {
            setSelectedIds([]);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} selected
        </div>
        <Button
          variant="destructive"
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0 || bulkDelete.isPending}
        >
          Delete Selected
        </Button>
      </div>

      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-2 p-2 border rounded">
            <Checkbox
              checked={selectedIds.includes(user.id)}
              onCheckedChange={() => handleToggle(user.id)}
            />
            <span>{user.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔍 Пример: Поиск и фильтрация

```tsx
import { useState } from 'react';
import { useUsers } from '@/lib/hooks/api/useUsers';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FilteredUsersExample() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  // Queries автоматически обновятся при изменении filters
  const { data: users, isLoading } = useUsers({
    search,
    role: role || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {users?.map(user => (
            <div key={user.id}>{user.email}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ⚡ Пример: Оптимистичное обновление

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateUser } from '@/lib/hooks/mutations/useUserMutations';
import { userKeys } from '@/lib/api/query-keys';
import type { User } from '@/types/api';

export default function OptimisticUpdateExample({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser({
    // Оптимистичное обновление - UI обновляется мгновенно
    onMutate: async (variables) => {
      // Отменяем текущие queries
      await queryClient.cancelQueries({ queryKey: userKeys.detail(variables.id) });

      // Сохраняем предыдущее значение для rollback
      const previousUser = queryClient.getQueryData(userKeys.detail(variables.id));

      // Оптимистично обновляем кэш
      queryClient.setQueryData(userKeys.detail(variables.id), (old: User | undefined) => {
        if (!old) return old;
        return { ...old, ...variables.data };
      });

      return { previousUser };
    },
    // При ошибке - откатываем изменения
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(variables.id),
          context.previousUser
        );
      }
    },
  });

  const handleToggleRole = () => {
    const newRole = user.role === 'admin' ? 'manager' : 'admin';
    updateUser.mutate({
      id: user.id,
      data: { role: newRole },
    });
  };

  return (
    <button onClick={handleToggleRole}>
      Current role: {user.role}
    </button>
  );
}
```

## 🚀 Пример: Prefetching (предзагрузка)

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/api/query-keys';
import { getUser } from '@/lib/api/endpoints/users';

export default function PrefetchExample({ users }: { users: User[] }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = (userId: number) => {
    // Предзагружаем данные пользователя при наведении
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(userId),
      queryFn: () => getUser(userId),
    });
  };

  return (
    <div className="space-y-2">
      {users.map(user => (
        <div
          key={user.id}
          onMouseEnter={() => handleMouseEnter(user.id)}
          className="p-4 border rounded cursor-pointer hover:bg-muted"
        >
          {user.email}
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Пример: Полноценная таблица с всеми возможностями

```tsx
import { useState } from 'react';
import { useUsers } from '@/lib/hooks/api/useUsers';
import {
  useDeleteUser,
  useBulkDeleteUsers,
  useBulkUpdateUserRoles,
} from '@/lib/hooks/mutations/useUserMutations';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompleteUserTableExample() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState({ search: '', role: '' });

  // Query
  const { data: users, isLoading, error } = useUsers(filters);

  // Mutations
  const deleteUser = useDeleteUser();
  const bulkDelete = useBulkDeleteUsers();
  const bulkUpdateRoles = useBulkUpdateUserRoles();

  const handleDelete = (userId: number) => {
    if (confirm('Delete this user?')) {
      deleteUser.mutate(userId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} users?`)) {
      bulkDelete.mutate({ user_ids: selectedIds }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleBulkUpdateRole = (role: string) => {
    if (selectedIds.length === 0) return;
    bulkUpdateRoles.mutate({ user_ids: selectedIds, role }, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={handleBulkDelete} variant="destructive">
            Delete {selectedIds.length}
          </Button>
          <Button onClick={() => handleBulkUpdateRole('admin')}>
            Make Admin
          </Button>
          <Button onClick={() => handleBulkUpdateRole('manager')}>
            Make Manager
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="space-y-2">
        {users?.map(user => (
          <div key={user.id} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              checked={selectedIds.includes(user.id)}
              onChange={() => {
                setSelectedIds(prev =>
                  prev.includes(user.id)
                    ? prev.filter(id => id !== user.id)
                    : [...prev, user.id]
                );
              }}
            />
            <div className="flex-1">
              <div>{user.email}</div>
              <div className="text-sm text-muted-foreground">{user.role}</div>
            </div>
            <Button
              onClick={() => handleDelete(user.id)}
              variant="ghost"
              size="sm"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```
