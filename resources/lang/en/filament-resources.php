<?php

return [
    'resources' => [
        'category' => [
            'label' => 'Category',
            'plural_label' => 'Categories',
            'navigation_label' => 'Categories',
            'fields' => [
                'handle' => 'Handle',
                'name' => 'Name',
                'title' => 'Title',
                'description' => 'Description',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'headings' => [
                'details' => 'Details',
                'relationships' => 'Relationships',
            ],
            'relations' => [
                'collections' => [
                    'label' => 'Collection',
                    'plural_label' => 'Collections',
                ],
                'options' => [
                    'label' => 'Option',
                    'plural_label' => 'Options',
                ],
                'brands' => [
                    'label' => 'Brand',
                    'plural_label' => 'Brands',
                ],
                'products' => [
                    'label' => 'Product',
                    'plural_label' => 'Products',
                ],
            ],
        ],
        'collection' => [
            'label' => 'Collection',
            'plural_label' => 'Collections',
            'navigation_label' => 'Collections',
            'fields' => [
                'handle' => 'Handle',
                'name' => 'Name',
                'title' => 'Title',
                'description' => 'Description',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'relations' => [
                'categories' => [
                    'label' => 'Category',
                    'plural_label' => 'Categories',
                ],
            ],
        ],
        'option' => [
            'label' => 'Option',
            'plural_label' => 'Options',
            'navigation_label' => 'Options',
            'fields' => [
                'name' => 'Name',
                'title' => 'Title',
                'description' => 'Description',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'relations' => [
                'values' => [
                    'label' => 'Value',
                    'plural_label' => 'Values',
                ],
                'categories' => [
                    'label' => 'Category',
                    'plural_label' => 'Categories',
                ],
            ],
        ],
        'option-value' => [
            'label' => 'Option Value',
            'plural_label' => 'Option Values',
            'navigation_label' => 'Option Values',
            'fields' => [
                'option_id' => 'Option',
                'value' => 'Value',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
        ],
        'brand' => [
            'label' => 'Brand',
            'plural_label' => 'Brands',
            'navigation_label' => 'Brands',
            'fields' => [
                'handle' => 'Handle',
                'name' => 'Name',
                'title' => 'Title',
                'description' => 'Description',
                'settings' => [
                    'label' => 'Settings',
                    'currency' => 'Currency',
                    'contact_email' => 'Contact Email',
                    'contact_phone' => 'Contact Phone',
                ],
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'relations' => [
                'users' => [
                    'label' => 'User',
                    'plural_label' => 'Users',
                ],
            ],
        ],
        'user' => [
            'label' => 'User',
            'plural_label' => 'Users',
            'navigation_label' => 'Users',
            'fields' => [
                'first_name' => 'First Name',
                'last_name' => 'Last Name',
                'email' => 'Email',
                'password' => 'Password',
                'role' => 'Role',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'relations' => [
                'brands' => [
                    'label' => 'Brand',
                    'plural_label' => 'Brands',
                ],
            ],
        ],
    ],
];
