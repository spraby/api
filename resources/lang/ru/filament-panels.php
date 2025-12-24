<?php

return [
    'pages' => [
        'dashboard' => [
            'title' => 'Spraby Dashboard',
        ],
    ],

    'resources' => [
        'label' => 'Ресурсы',
        'title' => 'Ресурсы',
    ],

    'navigation' => [
        'groups' => [
            'Shop' => 'Магазин',
            'Users' => 'Пользователи',
            'Settings' => 'Настройки',
        ],
    ],

    'widgets' => [
        'account' => [
            'label' => 'Аккаунт',
            'actions' => [
                'edit_profile' => [
                    'label' => 'Редактировать профиль',
                ],
            ],
        ],
    ],

    'auth' => [
        'title' => 'Авторизация',
        'heading' => 'Вход в систему',
        'actions' => [
            'login' => [
                'label' => 'Войти',
            ],
            'logout' => [
                'label' => 'Выйти',
            ],
        ],
        'fields' => [
            'email' => [
                'label' => 'Email',
            ],
            'password' => [
                'label' => 'Пароль',
            ],
            'remember' => [
                'label' => 'Запомнить меня',
            ],
        ],
        'messages' => [
            'failed' => 'Неверные учетные данные.',
        ],
    ],

    'layout' => [
        'direction' => 'ltr',
        'sidebar' => [
            'collapse' => [
                'label' => 'Свернуть боковую панель',
            ],
            'expand' => [
                'label' => 'Развернуть боковую панель',
            ],
        ],
        'language' => 'Язык',
    ],
];
