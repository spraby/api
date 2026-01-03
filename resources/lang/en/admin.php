<?php

return [
    'nav' => [
        'dashboard' => 'Dashboard',
        'users' => 'Users',
        'products' => 'Products',
        'media' => 'Media',
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
            'clear_selection' => 'Clear selection',
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

    'products' => [
        'title' => 'Products',
        'description' => 'Manage your product catalog',
    ],

    'products_table' => [
        'columns' => [
            'id' => 'ID',
            'image' => 'Image',
            'title' => 'Title',
            'price' => 'Price',
            'status' => 'Status',
            'brand' => 'Brand',
            'created' => 'Created',
        ],
        'status' => [
            'enabled' => 'Active',
            'disabled' => 'Inactive',
        ],
        'actions' => [
            'edit' => 'Edit',
            'delete' => 'Delete',
            'open_menu' => 'Open menu',
        ],
        'bulk' => [
            'selected' => 'selected',
            'change_status' => 'Change status...',
            'update_status' => 'Update Status',
            'delete_selected' => 'Delete Selected',
            'clear_selection' => 'Clear selection',
        ],
        'filters' => [
            'search_placeholder' => 'Search by title...',
            'all_statuses' => 'All statuses',
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
        'empty' => 'No products found.',
        'confirm' => [
            'delete_one' => 'Are you sure you want to delete',
            'delete_many' => 'Are you sure you want to delete',
            'products' => 'product(s)?',
        ],
    ],

    'products_edit' => [
        'title' => 'Edit Product',
        'description' => 'Update product information and variants',
        'sections' => [
            'product_info' => 'Product Information',
            'product_images' => 'Product Images',
            'variants' => 'Product Variants',
        ],
        'no_images' => 'No images uploaded for this product',
        'fields' => [
            'title' => 'Title',
            'description' => 'Description',
            'category' => 'Category',
            'price' => 'Price',
            'final_price' => 'Final Price',
            'enabled' => 'Product Enabled',
            'variant_title' => 'Variant Title',
            'variant_enabled' => 'Variant Enabled',
        ],
        'placeholders' => [
            'title' => 'Enter product title',
            'description' => 'Enter product description...',
            'category' => 'Select category',
            'price' => '0.00',
            'final_price' => '0.00',
            'variant_title' => 'e.g., Small, Medium, Red, etc.',
        ],
        'category' => [
            'none' => 'No category',
        ],
        'variant' => 'Variant',
        'required_fields' => 'Required fields',
        'actions' => [
            'back' => 'Back to Products',
            'add_variant' => 'Add Variant',
            'cancel' => 'Cancel',
            'save' => 'Save Changes',
            'saving' => 'Saving...',
        ],
        'errors' => [
            'at_least_one_variant' => 'Product must have at least one variant',
        ],
    ],

    'media' => [
        'title' => 'Media Library',
        'upload_button' => 'Upload Images',
        'upload_dialog_title' => 'Upload Images',
        'upload_dialog_description' => 'Select up to 50 images to upload to your media library.',
        'select_files' => 'Click to select files',
        'max_files' => 'Maximum 50 files, 10MB each',
        'max_files_error' => 'You can upload a maximum of 50 files at once',
        'no_files_selected' => 'Please select files to upload',
        'files_selected' => ':count file(s) selected',
        'selected_files' => 'Selected files',
        'delete_confirm_title' => 'Delete Image',
        'delete_confirm_description' => 'Are you sure you want to delete this image? This action cannot be undone.',
        'empty_title' => 'No images yet',
        'empty_description' => 'Upload your first images to get started with your media library.',
        'upload_first_images' => 'Upload Images',
    ],

    'common' => [
        'cancel' => 'Cancel',
        'delete' => 'Delete',
        'upload' => 'Upload',
        'uploading' => 'Uploading...',
        'save' => 'Save',
        'saving' => 'Saving...',
    ],

    'pagination' => [
        'previous' => 'Previous',
        'next' => 'Next',
        'page_of' => 'Page :current of :total',
    ],
];
