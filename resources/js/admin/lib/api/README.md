# API Service Documentation

Современный API сервис для React админки, построенный на TanStack Query (React Query) и нативном Fetch API с интеграцией Inertia.js.

## 📁 Структура

```
lib/api/
├── fetch-client.ts     # Fetch client с Inertia CSRF интеграцией
├── query-client.ts     # TanStack Query конфигурация
├── query-keys.ts       # Cache keys factory
├── utils.ts            # Утилиты для обработки ошибок
├── endpoints/          # API endpoints по доменам
│   └── users.ts        # User CRUD endpoints
└── README.md           # Эта документация

lib/hooks/
├── api/                # Query hooks для получения данных
│   └── useUsers.ts     # useUsers, useUser
└── mutations/          # Mutation hooks для изменения данных
    └── useUserMutations.ts  # CRUD mutations для Users
```

## 🚀 Быстрый старт

### 1. Query Hook (получение данных)

```tsx
import { useUsers } from '@/lib/hooks/api/useUsers';

export default function UsersList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  );
}
```

### 2. Mutation Hook (изменение данных)

```tsx
import { useDeleteUser } from '@/lib/hooks/mutations/useUserMutations';

export default function UserRow({ user }) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        console.log('User deleted!');
      }
    });
  };

  return (
    <div>
      {user.email}
      <button
        onClick={handleDelete}
        disabled={deleteUser.isPending}
      >
        Delete
      </button>
    </div>
  );
}
```

## 📚 Доступные Hooks

### Query Hooks (чтение данных)

#### `useUsers(filters?, options?)`
Получить список всех пользователей.

**Параметры:**
- `filters` (optional): `{ search?: string, role?: string, page?: number }`
- `options` (optional): React Query options

**Возвращает:**
```typescript
{
  data: User[],
  isLoading: boolean,
  error: ApiError | null,
  refetch: () => void,
  // ... другие свойства UseQueryResult
}
```

**Пример:**
```tsx
const { data: users, isLoading } = useUsers({ role: 'admin' });
```

#### `useUser(id, options?)`
Получить одного пользователя по ID.

**Параметры:**
- `id`: number - ID пользователя
- `options` (optional): React Query options

**Пример:**
```tsx
const { data: user } = useUser(1);
```

### Mutation Hooks (изменение данных)

#### `useCreateUser(options?)`
Создать нового пользователя.

**Пример:**
```tsx
const createUser = useCreateUser();

const handleSubmit = (formData) => {
  createUser.mutate({
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.passwordConfirmation,
    role: formData.role,
  });
};
```

#### `useUpdateUser(options?)`
Обновить существующего пользователя.

**Пример:**
```tsx
const updateUser = useUpdateUser();

const handleUpdate = (userId, formData) => {
  updateUser.mutate({
    id: userId,
    data: {
      first_name: formData.firstName,
      email: formData.email,
    }
  });
};
```

#### `useDeleteUser(options?)`
Удалить пользователя.

**Пример:**
```tsx
const deleteUser = useDeleteUser();

const handleDelete = (userId) => {
  if (confirm('Are you sure?')) {
    deleteUser.mutate(userId);
  }
};
```

#### `useBulkDeleteUsers(options?)`
Массовое удаление пользователей.

**Пример:**
```tsx
const bulkDelete = useBulkDeleteUsers();

const handleBulkDelete = (userIds) => {
  bulkDelete.mutate({ user_ids: userIds });
};
```

#### `useBulkUpdateUserRoles(options?)`
Массовое обновление ролей пользователей.

**Пример:**
```tsx
const bulkUpdateRoles = useBulkUpdateUserRoles();

const handleBulkUpdate = (userIds, newRole) => {
  bulkUpdateRoles.mutate({
    user_ids: userIds,
    role: newRole,
  });
};
```

## 🎯 Продвинутые примеры

### Optimistic Updates (мгновенное обновление UI)

```tsx
const updateUser = useUpdateUser({
  onMutate: async (variables) => {
    // Отменяем текущие queries
    await queryClient.cancelQueries({ queryKey: userKeys.detail(variables.id) });

    // Сохраняем предыдущее состояние для rollback
    const previousUser = queryClient.getQueryData(userKeys.detail(variables.id));

    // Оптимистично обновляем UI
    queryClient.setQueryData(userKeys.detail(variables.id), (old) => ({
      ...old,
      ...variables.data,
    }));

    return { previousUser };
  },
  onError: (err, variables, context) => {
    // Откатываем изменения при ошибке
    if (context?.previousUser) {
      queryClient.setQueryData(
        userKeys.detail(variables.id),
        context.previousUser
      );
    }
  },
});
```

### Фильтрация и поиск

```tsx
const [filters, setFilters] = useState({ search: '', role: '' });
const { data: users } = useUsers(filters);

const handleSearch = (searchTerm) => {
  setFilters(prev => ({ ...prev, search: searchTerm }));
};

const handleRoleFilter = (role) => {
  setFilters(prev => ({ ...prev, role }));
};
```

### Ручная инвалидация кэша

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/api/query-keys';

const queryClient = useQueryClient();

// Инвалидировать все user queries
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Инвалидировать только списки
queryClient.invalidateQueries({ queryKey: userKeys.lists() });

// Инвалидировать конкретного пользователя
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
```

### Prefetching (предзагрузка данных)

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/api/query-keys';
import { getUser } from '@/lib/api/endpoints/users';

const queryClient = useQueryClient();

const handleMouseEnter = (userId) => {
  // Предзагружаем данные пользователя при наведении
  queryClient.prefetchQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUser(userId),
  });
};
```

## ⚙️ Конфигурация

### Global Query Configuration

Глобальные настройки находятся в `lib/api/query-client.ts`:

```typescript
{
  staleTime: 1000 * 60 * 5,      // 5 минут - данные свежие
  gcTime: 1000 * 60 * 10,        // 10 минут - кэш
  refetchOnWindowFocus: false,    // Не refetch при фокусе
  refetchOnReconnect: true,       // Refetch при восстановлении сети
  retry: 2,                       // Максимум 2 повтора
}
```

### Fetch Client с Inertia CSRF

Fetch client автоматически добавляет в каждый запрос:
- CSRF токен из meta-тега (Laravel/Inertia интеграция)
- `X-Requested-With: XMLHttpRequest` header
- `Content-Type: application/json` header
- `Accept: application/json` header
- `credentials: 'same-origin'` для поддержки cookies/sessions

### Автоматическая обработка ошибок

Все HTTP ошибки автоматически трансформируются в ApiError:
- 401 → Unauthorized (можно настроить автоматический редирект на /login)
- 403 → Forbidden
- 404 → Resource not found
- 422 → Validation errors (Laravel validation)
- 500 → Server error

Ошибки валидации (422) содержат поле `errors` с детальным описанием:
```typescript
{
  message: "Validation failed",
  errors: {
    email: ["Email is required", "Email must be valid"],
    password: ["Password must be at least 8 characters"]
  }
}
```

## 🛠️ Утилиты

### Error Handling

```tsx
import { handleApiError, getErrorMessage } from '@/lib/api/utils';

// Показать все ошибки через toast
try {
  await someApiCall();
} catch (error) {
  handleApiError(error);
}

// Получить только текст ошибки
const errorMessage = getErrorMessage(error, 'Fallback message');
```

### Toast Notifications

```tsx
import { showSuccessToast, showErrorToast } from '@/lib/api/utils';

showSuccessToast('Operation completed!');
showErrorToast('Something went wrong');
```

## 🔍 Debugging

### React Query DevTools

DevTools автоматически включены в development mode:
- Открываются по иконке в правом нижнем углу
- Показывают все queries, их статус и данные
- Позволяют вручную инвалидировать кэш

### Logging

Для отладки можно включить логирование:

```tsx
const { data, isLoading } = useUsers();

console.log('Query state:', { data, isLoading });
```

## 📋 Best Practices

### 1. Всегда используйте hooks вместо прямых вызовов API

❌ **Плохо:**
```tsx
import { getUsers } from '@/lib/api/endpoints/users';

const users = await getUsers();
```

✅ **Хорошо:**
```tsx
import { useUsers } from '@/lib/hooks/api/useUsers';

const { data: users } = useUsers();
```

### 2. Обрабатывайте loading и error states

```tsx
const { data, isLoading, error } = useUsers();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <UserList users={data} />;
```

### 3. Используйте query keys правильно

```tsx
// ✅ Используйте factory
import { userKeys } from '@/lib/api/query-keys';
queryClient.invalidateQueries({ queryKey: userKeys.all });

// ❌ Не хардкодьте ключи
queryClient.invalidateQueries({ queryKey: ['users'] });
```

### 4. Инвалидируйте кэш после мутаций

Это происходит автоматически в наших mutation hooks, но если вы создаете собственные:

```tsx
const mutation = useMutation({
  mutationFn: myApiCall,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  },
});
```

## 🚀 Добавление новых API endpoints

### 1. Создайте типы в `types/api.ts`

```typescript
export interface Product {
  id: number;
  name: string;
  price: string;
}
```

### 2. Создайте endpoints в `lib/api/endpoints/products.ts`

```typescript
import fetchClient from '../fetch-client';

export async function getProducts(): Promise<Product[]> {
  const response = await fetchClient.get<Product[]>('/sb/admin/products/api');
  return response.data;
}
```

### 3. Добавьте query keys в `lib/api/query-keys.ts`

```typescript
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters) => [...productKeys.lists(), filters] as const,
};
```

### 4. Создайте hooks

Query hook в `lib/hooks/api/useProducts.ts`:
```typescript
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: getProducts,
  });
}
```

Mutation hook в `lib/hooks/mutations/useProductMutations.ts`:
```typescript
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

## 📖 Дополнительные ресурсы

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Fetch API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## ❓ Troubleshooting

### Запросы не кэшируются

Проверьте, что вы используете одинаковые query keys:
```tsx
// Эти queries будут кэшироваться отдельно!
useUsers({ role: 'admin' });
useUsers({ role: 'manager' });

// Эти будут использовать один кэш
useUsers();
useUsers();
```

### Данные не обновляются после мутации

Убедитесь, что вы инвалидируете правильные query keys:
```tsx
queryClient.invalidateQueries({ queryKey: userKeys.lists() });
```

### CSRF token missing

Убедитесь, что в HTML есть meta tag:
```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```
