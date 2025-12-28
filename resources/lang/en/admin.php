<?php

return [
    'nav' => [
        'dashboard' => 'Dashboard',
        'users' => 'Users',
        'settings' => 'Settings',
        'documents' => 'Documents',
    ],

    'user' => [
        'account' => 'Account',
        'logout' => 'Log out',
    ],

    'theme' => [
        'light' => 'Light',
        'dark' => 'Dark',
        'system' => 'System',
        'toggle' => 'Toggle theme',
    ],

    'language' => [
        'switch' => 'Switch language',
        'russian' => 'Русский',
        'english' => 'English',
    ],

    'users' => [
        'title' => 'Users',
        'description' => 'Manage users and their permissions',
    ],

    'users_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Name',
            'role' => 'Role',
            'created' => 'Created',
            'created_at' => 'Created',
        ],
        'roles' => [
            'user' => 'User',
            'admin' => 'Admin',
            'manager' => 'Manager',
        ],
        'actions' => [
            'edit' => 'Edit',
            'delete' => 'Delete',
            'open_menu' => 'Open menu',
        ],
        'bulk' => [
            'selected' => 'selected',
            'change_role' => 'Change role...',
            'update_role' => 'Update Role',
            'delete_selected' => 'Delete Selected',
        ],
        'filters' => [
            'search_placeholder' => 'Search by name or email...',
            'all_roles' => 'All roles',
            'columns' => 'Columns',
        ],
        'pagination' => [
            'rows_selected' => 'of',
            'row' => 'row(s)',
            'rows_per_page' => 'Rows per page',
            'page' => 'Page',
            'of' => 'of',
            'go_first' => 'Go to first page',
            'go_previous' => 'Go to previous page',
            'go_next' => 'Go to next page',
            'go_last' => 'Go to last page',
        ],
        'empty' => 'No users found.',
        'confirm' => [
            'delete_one' => 'Are you sure you want to delete',
            'delete_many' => 'Are you sure you want to delete',
            'users' => 'user(s)?',
        ],
        'messages' => [
            'deleted_success' => 'User deleted successfully',
            'deleted_failed' => 'Failed to delete user',
            'deleted_many_success' => 'Successfully deleted',
            'deleted_many_users' => 'user(s)',
            'deleted_many_failed' => 'Failed to delete users',
            'role_updated_success' => 'Successfully updated role for',
            'role_updated_users' => 'user(s)',
            'role_updated_failed' => 'Failed to update roles',
        ],
    ],

    'users_edit' => [
        'title' => 'Edit User',
        'description' => 'Update user information and permissions',
        'fields' => [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'email' => 'Email',
            'role' => 'Role',
        ],
        'placeholders' => [
            'first_name' => 'Enter first name',
            'last_name' => 'Enter last name',
            'email' => 'user@example.com',
            'role' => 'Select role',
        ],
        'roles' => [
            'none' => 'User (No role)',
            'admin' => 'Admin',
            'manager' => 'Manager',
        ],
        'required_fields' => 'Required fields',
        'actions' => [
            'cancel' => 'Cancel',
            'save' => 'Save Changes',
            'saving' => 'Saving...',
        ],
        'messages' => [
            'update_failed' => 'Failed to update user. Please check the form for errors.',
        ],
    ],
];
