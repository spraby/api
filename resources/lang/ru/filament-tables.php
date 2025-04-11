<?php

return [
    'columns' => [
        'text' => [
            'more_list_items' => 'и еще :count',
        ],
    ],
    'fields' => [
        'search' => [
            'label' => 'Поиск',
            'placeholder' => 'Поиск',
        ],
    ],
    'pagination' => [
        'label' => 'Навигация по страницам',
        'overview' => 'Показано с :first по :last из :total',
        'fields' => [
            'records_per_page' => [
                'label' => 'на странице',
            ],
        ],
        'actions' => [
            'go_to_page' => [
                'label' => 'Перейти к странице :page',
            ],
            'next' => [
                'label' => 'Следующая',
            ],
            'previous' => [
                'label' => 'Предыдущая',
            ],
        ],
    ],
    'actions' => [
        'filter' => [
            'label' => 'Фильтр',
        ],
        'open_bulk_actions' => [
            'label' => 'Открыть действия',
        ],
        'toggle_columns' => [
            'label' => 'Переключить столбцы',
        ],
    ],
    'empty' => [
        'heading' => 'Нет записей',
    ],
    'filters' => [
        'actions' => [
            'reset' => [
                'label' => 'Сбросить фильтры',
            ],
        ],
        'heading' => 'Фильтры',
        'multi_select' => [
            'placeholder' => 'Все',
        ],
        'select' => [
            'placeholder' => 'Все',
        ],
    ],
    'selection_indicator' => [
        'selected_count' => 'Выбрана 1 запись|Выбрано :count записей',
        'actions' => [
            'select_all' => [
                'label' => 'Выбрать все :count',
            ],
            'deselect_all' => [
                'label' => 'Отменить выбор всех',
            ],
        ],
    ],
];
