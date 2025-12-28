<?php

return [
    'nav' => [
        'dashboard' => 'Панель управления',
        'users' => 'Пользователи',
        'settings' => 'Настройки',
        'documents' => 'Документы',
    ],

    'user' => [
        'account' => 'Аккаунт',
        'logout' => 'Выйти',
    ],

    'theme' => [
        'light' => 'Светлая',
        'dark' => 'Тёмная',
        'system' => 'Системная',
        'toggle' => 'Переключить тему',
    ],

    'language' => [
        'switch' => 'Переключить язык',
        'russian' => 'Русский',
        'english' => 'English',
    ],

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
            'created_at' => 'Создан',
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
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по имени или email...',
            'all_roles' => 'Все роли',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Пользователи не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'users' => 'пользователей?',
        ],
        'messages' => [
            'deleted_success' => 'Пользователь удалён успешно',
            'deleted_failed' => 'Не удалось удалить пользователя',
            'deleted_many_success' => 'Успешно удалено',
            'deleted_many_users' => 'пользователей',
            'deleted_many_failed' => 'Не удалось удалить пользователей',
            'role_updated_success' => 'Роль обновлена для',
            'role_updated_users' => 'пользователей',
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
];
