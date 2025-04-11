<?php

return [
    'components' => [
        'text_input' => [
            'validation_attribute' => 'текстовое поле',
        ],
        'select' => [
            'validation_attribute' => 'выбор',
            'placeholder' => 'Выберите опцию',
            'searching_message' => 'Поиск...',
            'no_search_results_message' => 'Нет результатов для вашего запроса.',
        ],
        'checkbox' => [
            'validation_attribute' => 'флажок',
        ],
        'date_time_picker' => [
            'validation_attribute' => 'дата и время',
        ],
        'file_upload' => [
            'validation_attribute' => 'файл',
        ],
        'rich_editor' => [
            'validation_attribute' => 'текст',
            'toolbar_buttons' => [
                'bold' => 'Жирный',
                'italic' => 'Курсив',
                'underline' => 'Подчеркнутый',
                'strike' => 'Зачеркнутый',
                'link' => 'Ссылка',
                'h1' => 'Заголовок 1',
                'h2' => 'Заголовок 2',
                'h3' => 'Заголовок 3',
                'bulletList' => 'Маркированный список',
                'orderedList' => 'Нумерованный список',
                'redo' => 'Повторить',
                'undo' => 'Отменить',
            ],
        ],
        'repeater' => [
            'validation_attribute' => 'повторитель',
            'actions' => [
                'add' => [
                    'label' => 'Добавить',
                ],
                'delete' => [
                    'label' => 'Удалить',
                ],
                'clone' => [
                    'label' => 'Клонировать',
                ],
                'reorder' => [
                    'label' => 'Переместить',
                ],
                'move_up' => [
                    'label' => 'Переместить вверх',
                ],
                'move_down' => [
                    'label' => 'Переместить вниз',
                ],
                'collapse' => [
                    'label' => 'Свернуть',
                ],
                'expand' => [
                    'label' => 'Развернуть',
                ],
            ],
        ],
    ],
    'validation' => [
        'required' => 'Обязательное поле',
        'unique' => 'Значение уже существует',
    ],
];
