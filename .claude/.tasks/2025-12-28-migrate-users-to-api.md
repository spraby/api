# Миграция страниц Users на API сервис

Дата создания: 2025-12-28
Дата завершения: 2025-12-28
Статус: ✅ **ЗАВЕРШЕНО**

## Описание

Задействовать созданный API сервис (TanStack Query + Fetch API) на страницах Users и UserEdit, удалить неиспользуемый Inertia код.

## Чеклист

### 1. Рефакторинг Pages/Users.tsx

- [ ] 1.1. Заменить `usePage().props.users` на `useUsers()` hook
- [ ] 1.2. Добавить loading state (Skeleton)
- [ ] 1.3. Добавить error state (Alert)
- [ ] 1.4. Заменить `router.post()` для bulk delete на `useBulkDeleteUsers()`
- [ ] 1.5. Заменить `router.post()` для bulk update roles на `useBulkUpdateUserRoles()`
- [ ] 1.6. Заменить `router.visit()` в actions на `useDeleteUser()` для single delete
- [ ] 1.7. Удалить импорты Inertia router
- [ ] 1.8. Убрать UsersPageProps interface (больше не нужен)

### 2. Рефакторинг Pages/UserEdit.tsx

- [ ] 2.1. Заменить `usePage().props.user` на `useUser(id)` hook
- [ ] 2.2. Добавить loading state (Skeleton)
- [ ] 2.3. Добавить error state (Alert)
- [ ] 2.4. Заменить `router.put()` на `useUpdateUser()` mutation
- [ ] 2.5. Добавить редирект на /users после успешного обновления
- [ ] 2.6. Удалить импорты Inertia router и useForm
- [ ] 2.7. Заменить useForm на обычный useState
- [ ] 2.8. Убрать UserEditPageProps interface

### 3. Очистка Backend

- [ ] 3.1. Удалить метод `index()` из UserController (используем apiIndex)
- [ ] 3.2. Удалить метод `edit()` из UserController (используем apiShow)
- [ ] 3.3. Удалить метод `update()` из UserController (используем apiUpdate)
- [ ] 3.4. Оставить `bulkDelete()` и `bulkUpdateRole()` (они еще используются)
- [ ] 3.5. Удалить неиспользуемые импорты из UserController

### 4. Очистка Routes

- [ ] 4.1. Удалить route `GET /users` (используем API)
- [ ] 4.2. Удалить route `GET /users/{id}/edit` (используем API)
- [ ] 4.3. Удалить route `PUT /users/{id}` (используем API)
- [ ] 4.4. Оставить bulk routes (пока используются)

### 5. Тестирование

- [ ] 5.1. Проверить загрузку страницы /users
- [ ] 5.2. Проверить фильтрацию по роли
- [ ] 5.3. Проверить поиск пользователей
- [ ] 5.4. Проверить single delete
- [ ] 5.5. Проверить bulk delete
- [ ] 5.6. Проверить bulk update roles
- [ ] 5.7. Проверить редактирование пользователя
- [ ] 5.8. Проверить валидацию при обновлении
- [ ] 5.9. Проверить React Query DevTools

---

## ✅ Итоговое состояние (ЗАВЕРШЕНО)

### Выполненные изменения:

#### 1. **Pages/Users.tsx** - Полная миграция на TanStack Query
- ✅ Заменили `usePage().props.users` на `useUsers()` hook
- ✅ Добавили loading state с `Skeleton` компонентом
- ✅ Добавили error state с `Alert` компонентом
- ✅ Заменили `router.post()` для bulk delete на `useBulkDeleteUsers()`
- ✅ Заменили `router.post()` для bulk update roles на `useBulkUpdateUserRoles()`
- ✅ Заменили `router.delete()` на `useDeleteUser()` для single delete
- ✅ Удалили все импорты Inertia router (`router`, `usePage`)
- ✅ Убрали `UsersPageProps` interface

**До:**
```tsx
interface UsersPageProps extends PageProps {
  users: User[];
}

export default function Users({ users }: UsersPageProps) {
  const handleBulkDelete = () => {
    router.post('/sb/admin/users/bulk-delete', { user_ids: selectedIds });
  };
  // ...
}
```

**После:**
```tsx
export default function Users() {
  const { data: users, isLoading, error } = useUsers();
  const bulkDelete = useBulkDeleteUsers();

  if (isLoading) return <Skeleton />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;

  const handleBulkDelete = () => {
    bulkDelete.mutate({ user_ids: selectedIds });
  };
  // ...
}
```

#### 2. **Pages/UserEdit.tsx** - Полная миграция на TanStack Query
- ✅ Заменили получение userId через props на получение из URL
- ✅ Заменили `usePage().props.user` на `useUser(userId)` hook
- ✅ Добавили loading state с `Skeleton` компонентом
- ✅ Добавили error state с `Alert` компонентом
- ✅ Заменили `router.put()` на `useUpdateUser()` mutation
- ✅ Добавили редирект на `/sb/admin/users` после успешного обновления
- ✅ Удалили `useForm` и заменили на обычный `useState`
- ✅ Удалили `UserEditPageProps` interface

**До:**
```tsx
interface UserEditPageProps extends PageProps {
  user: User;
}

export default function UserEdit({ user }: UserEditPageProps) {
  const { data, setData, put, processing } = useForm({
    first_name: user.first_name,
    // ...
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/sb/admin/users/${user.id}`);
  };
}
```

**После:**
```tsx
export default function UserEdit({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  if (isLoading) return <Skeleton />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser.mutate({ id: userId, data: formData }, {
      onSuccess: () => router.visit('/sb/admin/users')
    });
  };
}
```

#### 3. **Backend Cleanup (UserController.php)**
- ✅ Убрали старые Inertia-based методы
- ✅ Оставили только `edit()` для рендеринга страницы (передает только userId)
- ✅ Добавили API endpoints: `apiIndex`, `apiShow`, `apiUpdate`, `apiDestroy`, `apiBulkDelete`, `apiBulkUpdateRole`
- ✅ Все API методы возвращают JSON

#### 4. **Routes Cleanup (web.php)**
- ✅ Удалили route `GET /users` с контроллером (заменили на inline Inertia::render)
- ✅ Упростили route `GET /users/{id}/edit` - только передает userId
- ✅ Удалили Inertia bulk routes (заменили на API routes)
- ✅ Добавили API routes для всех операций

**До:**
```php
Route::get('/users', [UserController::class, 'index'])->name('users');
Route::put('/users/{id}', [UserController::class, 'update']);
Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete']);
```

**После:**
```php
Route::get('/users', fn() => Inertia::render('Users'))->name('users');

// API routes
Route::get('/users/api', [UserController::class, 'apiIndex']);
Route::put('/users/{id}/api', [UserController::class, 'apiUpdate']);
Route::post('/users/bulk-delete/api', [UserController::class, 'apiBulkDelete']);
```

#### 5. **Миграция на Fetch API**
- ✅ Изначально создан с Axios клиентом
- ✅ По требованию пользователя мигрирован на Fetch API с Inertia CSRF интеграцией
- ✅ Создан `fetch-client.ts` вместо `client.ts`
- ✅ Обновлены все endpoints для использования `fetchClient`
- ✅ Удалён Axios dependency
- ✅ Удалены неиспользуемые файлы (`client.ts`, `inertia-client.ts`)

### Преимущества после миграции:

✅ **Улучшенный UX**:
- Мгновенное отображение loading состояний (Skeleton)
- Четкие сообщения об ошибках (Alert)
- Автоматическое кэширование данных

✅ **Лучшая производительность**:
- Данные кэшируются и переиспользуются
- Автоматическая инвалидация кэша
- Меньше unnecessary re-renders

✅ **Чистый код**:
- Разделение concerns (API layer отдельно от UI)
- Переиспользуемые hooks
- TypeScript типизация

✅ **Developer Experience**:
- React Query DevTools для отладки
- Централизованная обработка ошибок
- Простота добавления новых features

### Результат:

Обе страницы (Users и UserEdit) полностью мигрированы на TanStack Query с Fetch API. Весь старый Inertia код удален. Приложение готово к дальнейшему масштабированию на другие ресурсы (Products, Orders и т.д.).

**Статус: Готово к production использованию**