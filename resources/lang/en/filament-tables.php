<?php

return [
    'columns' => [
        'text' => [
            'more_list_items' => 'and :count more',
        ],
    ],
    'fields' => [
        'search' => [
            'label' => 'Search',
            'placeholder' => 'Search',
        ],
    ],
    'pagination' => [
        'label' => 'Pagination',
        'overview' => 'Showing :first to :last of :total',
        'fields' => [
            'records_per_page' => [
                'label' => 'per page',
            ],
        ],
        'actions' => [
            'go_to_page' => [
                'label' => 'Go to page :page',
            ],
            'next' => [
                'label' => 'Next',
            ],
            'previous' => [
                'label' => 'Previous',
            ],
        ],
    ],
    'actions' => [
        'filter' => [
            'label' => 'Filter',
        ],
        'open_bulk_actions' => [
            'label' => 'Open actions',
        ],
        'toggle_columns' => [
            'label' => 'Toggle columns',
        ],
    ],
    'empty' => [
        'heading' => 'No records found',
    ],
    'filters' => [
        'actions' => [
            'reset' => [
                'label' => 'Reset filters',
            ],
        ],
        'heading' => 'Filters',
        'multi_select' => [
            'placeholder' => 'All',
        ],
        'select' => [
            'placeholder' => 'All',
        ],
    ],
    'selection_indicator' => [
        'selected_count' => '1 record selected|:count records selected',
        'actions' => [
            'select_all' => [
                'label' => 'Select all :count',
            ],
            'deselect_all' => [
                'label' => 'Deselect all',
            ],
        ],
    ],
];
