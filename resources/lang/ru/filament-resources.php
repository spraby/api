<?php

return [
    'resources' => [
        'category' => [
            'label' => 'Категория',
            'plural_label' => 'Категории',
            'navigation_label' => 'Категории',
            'fields' => [
                'handle' => 'Идентификатор',
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'headings' => [
                'details' => 'Детали',
                'relationships' => 'Связи',
            ],
            'relations' => [
                'collections' => [
                    'label' => 'Коллекции',
                    'plural_label' => 'Коллекции',
                ],
                'options' => [
                    'label' => 'Опция',
                    'plural_label' => 'Опции',
                ],
                'brands' => [
                    'label' => 'Бренд',
                    'plural_label' => 'Бренды',
                ],
                'products' => [
                    'label' => 'Товар',
                    'plural_label' => 'Товары',
                ],
            ],
        ],
        'collection' => [
            'label' => 'Коллекция',
            'plural_label' => 'Коллекции',
            'navigation_label' => 'Коллекции',
            'fields' => [
                'handle' => 'Идентификатор',
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'categories' => [
                    'label' => 'Категория',
                    'plural_label' => 'Категории',
                ],
            ],
        ],
        'option' => [
            'label' => 'Опция',
            'plural_label' => 'Опции',
            'navigation_label' => 'Опции',
            'fields' => [
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'values' => [
                    'label' => 'Значение',
                    'plural_label' => 'Значения',
                ],
                'categories' => [
                    'label' => 'Категория',
                    'plural_label' => 'Категории',
                ],
            ],
        ],
        'option-value' => [
            'label' => 'Значение опции',
            'plural_label' => 'Значения опций',
            'navigation_label' => 'Значения опций',
            'fields' => [
                'option_id' => 'Опция',
                'value' => 'Значение',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
        ],
        'brand' => [
            'label' => 'Бренд',
            'plural_label' => 'Бренды',
            'navigation_label' => 'Бренды',
            'fields' => [
                'handle' => 'Идентификатор',
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'settings' => [
                    'label' => 'Настройки',
                    'currency' => 'Валюта',
                    'contact_email' => 'Контактный email',
                    'contact_phone' => 'Контактный телефон',
                ],
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'users' => [
                    'label' => 'Пользователь',
                    'plural_label' => 'Пользователи',
                ],
            ],
        ],
        'user' => [
            'label' => 'Пользователь',
            'plural_label' => 'Пользователи',
            'navigation_label' => 'Пользователи',
            'fields' => [
                'first_name' => 'Имя',
                'last_name' => 'Фамилия',
                'email' => 'Email',
                'password' => 'Пароль',
                'role' => 'Роль',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'brands' => [
                    'label' => 'Бренд',
                    'plural_label' => 'Бренды',
                ],
            ],
        ],
    ],
];
