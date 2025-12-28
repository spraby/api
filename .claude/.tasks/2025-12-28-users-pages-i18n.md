# Мультиязычность страниц Users и UserEdit

Дата создания: 2025-12-28

## Описание
Добавить поддержку мультиязычности (русский/английский) на страницу списка пользователей (Users) и страницу редактирования пользователя (UserEdit).

## Чеклист

### Раздел 1: Подготовка - расширение файлов переводов
- [ ] 1.1. Обновить `resources/lang/ru/admin.php`:
  - [ ] 1.1.1. Добавить секцию 'users' с переводами для страницы списка
  - [ ] 1.1.2. Добавить секцию 'users_table' с переводами для таблицы
  - [ ] 1.1.3. Добавить секцию 'users_edit' с переводами для страницы редактирования
- [ ] 1.2. Обновить `resources/lang/en/admin.php`:
  - [ ] 1.2.1. Добавить секцию 'users' с английскими переводами
  - [ ] 1.2.2. Добавить секцию 'users_table' с английскими переводами
  - [ ] 1.2.3. Добавить секцию 'users_edit' с английскими переводами

### Раздел 2: Обновление страницы Users (список)
- [ ] 2.1. Обновить `/resources/js/admin/Pages/Users.tsx`:
  - [ ] 2.1.1. Добавить import useLang
  - [ ] 2.1.2. Заменить заголовок "Users" на __('admin.users.title')
  - [ ] 2.1.3. Заменить описание "Manage users..." на __('admin.users.description')

### Раздел 3: Обновление компонента UsersTable
- [ ] 3.1. Обновить `/resources/js/admin/components/users-table.tsx`:
  - [ ] 3.1.1. Добавить import useLang в компонент
  - [ ] 3.1.2. Обновить заголовки колонок (ID, Name, Role, Created)
  - [ ] 3.1.3. Обновить роли (User, Admin, Manager) в badge
  - [ ] 3.1.4. Обновить actions menu (Edit, Delete, Open menu)
  - [ ] 3.1.5. Обновить bulk actions bar:
    - [ ] 3.1.5.1. "X selected" текст
    - [ ] 3.1.5.2. "Change role..." placeholder
    - [ ] 3.1.5.3. "Update Role" кнопка
    - [ ] 3.1.5.4. "Delete Selected" кнопка
  - [ ] 3.1.6. Обновить фильтры:
    - [ ] 3.1.6.1. "Search by name or email..." placeholder
    - [ ] 3.1.6.2. "All roles" и роли в select
    - [ ] 3.1.6.3. "Columns" кнопка
  - [ ] 3.1.7. Обновить пагинацию:
    - [ ] 3.1.7.1. "X of Y row(s) selected"
    - [ ] 3.1.7.2. "Rows per page" label
    - [ ] 3.1.7.3. "Page X of Y" текст
    - [ ] 3.1.7.4. SR-only тексты для навигации
  - [ ] 3.1.8. Обновить "No users found." сообщение
  - [ ] 3.1.9. Обновить confirm диалоги:
    - [ ] 3.1.9.1. "Are you sure you want to delete..." (единичное)
    - [ ] 3.1.9.2. "Are you sure you want to delete X user(s)?" (множественное)
  - [ ] 3.1.10. Обновить toast сообщения:
    - [ ] 3.1.10.1. "User deleted successfully"
    - [ ] 3.1.10.2. "Failed to delete user"
    - [ ] 3.1.10.3. "Successfully deleted X user(s)"
    - [ ] 3.1.10.4. "Failed to delete users"
    - [ ] 3.1.10.5. "Successfully updated role for X user(s)"
    - [ ] 3.1.10.6. "Failed to update roles"

### Раздел 4: Обновление страницы UserEdit (редактирование)
- [ ] 4.1. Обновить `/resources/js/admin/Pages/UserEdit.tsx`:
  - [ ] 4.1.1. Добавить import useLang
  - [ ] 4.1.2. Обновить заголовок "Edit User"
  - [ ] 4.1.3. Обновить описание "Update user information..."
  - [ ] 4.1.4. Обновить labels полей формы:
    - [ ] 4.1.4.1. "First Name"
    - [ ] 4.1.4.2. "Last Name"
    - [ ] 4.1.4.3. "Email"
    - [ ] 4.1.4.4. "Role"
  - [ ] 4.1.5. Обновить placeholders:
    - [ ] 4.1.5.1. "Enter first name"
    - [ ] 4.1.5.2. "Enter last name"
    - [ ] 4.1.5.3. "user@example.com"
    - [ ] 4.1.5.4. "Select role"
  - [ ] 4.1.6. Обновить роли в select:
    - [ ] 4.1.6.1. "User (No role)"
    - [ ] 4.1.6.2. "Admin"
    - [ ] 4.1.6.3. "Manager"
  - [ ] 4.1.7. Обновить текст "Required fields"
  - [ ] 4.1.8. Обновить кнопки:
    - [ ] 4.1.8.1. "Cancel"
    - [ ] 4.1.8.2. "Save Changes"
    - [ ] 4.1.8.3. "Saving..."
  - [ ] 4.1.9. Обновить сообщение ошибки "Failed to update user..."

### Раздел 5: Тестирование
- [ ] 5.1. Очистить кеши Laravel (config:clear, cache:clear, view:clear)
- [ ] 5.2. Проверить TypeScript компиляцию (npx tsc --noEmit)
- [ ] 5.3. Открыть страницу /sb/admin/users на русском языке
- [ ] 5.4. Проверить все переведённые элементы на странице Users
- [ ] 5.5. Переключить на английский язык и проверить все тексты
- [ ] 5.6. Протестировать bulk actions (выделение, смена роли, удаление)
- [ ] 5.7. Протестировать фильтры и поиск
- [ ] 5.8. Протестировать пагинацию
- [ ] 5.9. Открыть страницу редактирования пользователя
- [ ] 5.10. Проверить все переведённые элементы на странице UserEdit
- [ ] 5.11. Протестировать форму редактирования (валидация, сохранение)
- [ ] 5.12. Проверить toast сообщения на обоих языках

## Файлы для изменения

### Backend (2 файла)
1. `resources/lang/ru/admin.php` - добавить переводы для users
2. `resources/lang/en/admin.php` - добавить английские переводы

### Frontend (3 файла)
1. `resources/js/admin/Pages/Users.tsx` - страница списка пользователей
2. `resources/js/admin/components/users-table.tsx` - таблица с пользователями
3. `resources/js/admin/Pages/UserEdit.tsx` - страница редактирования

**Итого**: 5 файлов

## Структура переводов

### Для русского (ru/admin.php)
```php
'users' => [
    'title' => 'Пользователи',
    'description' => 'Управление пользователями и их правами',
],

'users_table' => [
    'columns' => [
        'id' => 'ID',
        'name' => 'Имя',
        'role' => 'Роль',
        'created' => 'Создан',
    ],
    'roles' => [
        'user' => 'Пользователь',
        'admin' => 'Администратор',
        'manager' => 'Менеджер',
    ],
    'actions' => [
        'edit' => 'Редактировать',
        'delete' => 'Удалить',
        'open_menu' => 'Открыть меню',
    ],
    'bulk' => [
        'selected' => 'выбрано',
        'change_role' => 'Изменить роль...',
        'update_role' => 'Обновить роль',
        'delete_selected' => 'Удалить выбранные',
    ],
    'filters' => [
        'search_placeholder' => 'Поиск по имени или email...',
        'all_roles' => 'Все роли',
        'columns' => 'Колонки',
    ],
    'pagination' => [
        'rows_selected' => 'из {total} строк выбрано',
        'rows_per_page' => 'Строк на странице',
        'page_of' => 'Страница {current} из {total}',
        'go_first' => 'На первую страницу',
        'go_previous' => 'На предыдущую страницу',
        'go_next' => 'На следующую страницу',
        'go_last' => 'На последнюю страницу',
    ],
    'empty' => 'Пользователи не найдены.',
    'confirm' => [
        'delete_one' => 'Вы уверены, что хотите удалить {name}?',
        'delete_many' => 'Вы уверены, что хотите удалить {count} пользователей?',
    ],
    'messages' => [
        'deleted_success' => 'Пользователь удалён успешно',
        'deleted_failed' => 'Не удалось удалить пользователя',
        'deleted_many_success' => 'Успешно удалено {count} пользователей',
        'deleted_many_failed' => 'Не удалось удалить пользователей',
        'role_updated_success' => 'Роль обновлена для {count} пользователей',
        'role_updated_failed' => 'Не удалось обновить роли',
    ],
],

'users_edit' => [
    'title' => 'Редактирование пользователя',
    'description' => 'Изменение информации и прав пользователя',
    'fields' => [
        'first_name' => 'Имя',
        'last_name' => 'Фамилия',
        'email' => 'Email',
        'role' => 'Роль',
    ],
    'placeholders' => [
        'first_name' => 'Введите имя',
        'last_name' => 'Введите фамилию',
        'email' => 'user@example.com',
        'role' => 'Выберите роль',
    ],
    'roles' => [
        'none' => 'Пользователь (без роли)',
        'admin' => 'Администратор',
        'manager' => 'Менеджер',
    ],
    'required_fields' => 'Обязательные поля',
    'actions' => [
        'cancel' => 'Отмена',
        'save' => 'Сохранить изменения',
        'saving' => 'Сохранение...',
    ],
    'messages' => [
        'update_failed' => 'Не удалось обновить пользователя. Проверьте форму на наличие ошибок.',
    ],
],
```

## Примерное время выполнения
- Раздел 1: 10-15 минут (расширение переводов)
- Раздел 2: 5 минут (страница Users)
- Раздел 3: 40-50 минут (компонент UsersTable - много текстов)
- Раздел 4: 20-25 минут (страница UserEdit)
- Раздел 5: 15-20 минут (тестирование)

**Общее время**: ~1.5-2 часа