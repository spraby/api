<?php

return [
    'components' => [
        'text_input' => [
            'validation_attribute' => 'text field',
        ],
        'select' => [
            'validation_attribute' => 'selection',
            'placeholder' => 'Select an option',
            'searching_message' => 'Searching...',
            'no_search_results_message' => 'No results found for your query.',
        ],
        'checkbox' => [
            'validation_attribute' => 'checkbox',
        ],
        'date_time_picker' => [
            'validation_attribute' => 'date and time',
        ],
        'file_upload' => [
            'validation_attribute' => 'file',
        ],
        'rich_editor' => [
            'validation_attribute' => 'text',
            'toolbar_buttons' => [
                'bold' => 'Bold',
                'italic' => 'Italic',
                'underline' => 'Underline',
                'strike' => 'Strikethrough',
                'link' => 'Link',
                'h1' => 'Heading 1',
                'h2' => 'Heading 2',
                'h3' => 'Heading 3',
                'bulletList' => 'Bullet List',
                'orderedList' => 'Numbered List',
                'redo' => 'Redo',
                'undo' => 'Undo',
            ],
        ],
        'repeater' => [
            'validation_attribute' => 'repeater',
            'actions' => [
                'add' => [
                    'label' => 'Add',
                ],
                'delete' => [
                    'label' => 'Delete',
                ],
                'clone' => [
                    'label' => 'Clone',
                ],
                'reorder' => [
                    'label' => 'Reorder',
                ],
                'move_up' => [
                    'label' => 'Move Up',
                ],
                'move_down' => [
                    'label' => 'Move Down',
                ],
                'collapse' => [
                    'label' => 'Collapse',
                ],
                'expand' => [
                    'label' => 'Expand',
                ],
            ],
        ],
    ],
    'validation' => [
        'required' => 'Required field',
        'unique' => 'The value already exists',
    ],
];
