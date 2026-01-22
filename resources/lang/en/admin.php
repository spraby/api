<?php

return [
    'nav' => [
        'dashboard' => 'Dashboard',
        'users' => 'Users',
        'products' => 'Products',
        'orders' => 'Orders',
        'media' => 'Media',
        'brands' => 'Brands',
        'settings' => 'Settings',
        'documents' => 'Documents',
        'brand_requests' => 'Brand Requests',
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
        'actions' => [
            'create' => 'Create Product',
        ],
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
        'success' => [
            'deleted' => 'Product deleted successfully',
            'bulk_deleted' => 'Products deleted successfully',
            'status_updated' => 'Product status updated successfully',
        ],
        'errors' => [
            'delete_failed' => 'Failed to delete product',
            'bulk_delete_failed' => 'Failed to delete products',
            'status_update_failed' => 'Failed to update product status',
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
        'images' => [
            'add_from_media' => 'Add from Media',
            'upload_new' => 'Upload New',
            'no_images' => 'No images for this product',
            'position' => 'Position',
            'main' => 'Main',
            'confirm_delete' => 'Remove this image from the product? It will remain in the media library.',
        ],
        'variants' => [
            'confirm_remove_image' => 'Remove image from this variant?',
        ],
        'variant_options' => [
            'title' => 'Option Values',
            'select_placeholder' => 'Select value',
        ],
        'fields' => [
            'title' => 'Title',
            'description' => 'Description',
            'category' => 'Category',
            'price' => 'Price',
            'final_price' => 'Final Price',
            'enabled' => 'Product Enabled',
            'variant_title' => 'Variant Title',
            'variant_enabled' => 'Variant Enabled',
            'variant_image' => 'Variant Image',
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
            'not_in_list' => 'Category is not in the brand\'s category list. Cannot edit this product.',
            'locked' => 'Category cannot be changed after product creation',
        ],
        'variant' => 'Variant',
        'required_fields' => 'Required fields',
        'actions' => [
            'back' => 'Back to Products',
            'add_variant' => 'Add Variant',
            'cancel' => 'Cancel',
            'save' => 'Save Changes',
            'saving' => 'Saving...',
            'select_image' => 'Select Image',
            'change_image' => 'Change Image',
        ],
        'errors' => [
            'at_least_one_variant' => 'Product must have at least one variant',
            'save_variant_first' => 'Please save the product first to add variant images',
            'image_not_attached' => 'This image is not attached to the product. Please attach it first.',
            'all_combinations_used' => 'All possible option combinations are already used. Cannot add more variants.',
            'duplicate_variants' => 'Cannot save product with duplicate variants. Please ensure each variant has a unique combination of options.',
        ],
        'hints' => [
            'save_to_add_image' => 'Save product first to add images',
        ],
        'success' => [
            'saved' => 'Product saved successfully',
        ],
        'duplicate_variants' => [
            'title' => 'Duplicate Variants Detected',
            'description' => 'The following variants have identical option values. Each variant should have a unique combination of options.',
            'group_label' => 'Variants',
        ],
    ],

    'products_create' => [
        'title' => 'Create Product',
        'description' => 'Add a new product to your catalog',
        'sections' => [
            'product_info' => 'Product Information',
        ],
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
        'required_fields' => 'Required fields',
        'actions' => [
            'back' => 'Back to Products',
            'add_variant' => 'Add Variant',
            'cancel' => 'Cancel',
            'create' => 'Create Product',
            'creating' => 'Creating...',
        ],
        'errors' => [
            'at_least_one_variant' => 'Product must have at least one variant',
            'all_combinations_used' => 'All possible option combinations are already used. Cannot add more variants.',
        ],
        'success' => [
            'created' => 'Product created successfully',
        ],
        'duplicate_variants' => [
            'title' => 'Duplicate Variants Detected',
            'description' => 'The following variants have identical option values. Each variant should have a unique combination of options.',
            'group_label' => 'Variants',
        ],
    ],

    'orders' => [
        'title' => 'Orders',
        'description' => 'Manage customer orders',
    ],

    'orders_table' => [
        'columns' => [
            'order' => 'Order',
            'customer' => 'Customer',
            'total' => 'Total',
            'status' => 'Status',
            'delivery' => 'Delivery',
            'payment' => 'Payment',
            'created' => 'Created',
        ],
        'items' => 'item(s)',
        'status' => [
            'pending' => 'Pending',
            'confirmed' => 'Confirmed',
            'processing' => 'Processing',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'archived' => 'Archived',
        ],
        'delivery_status' => [
            'pending' => 'Pending',
            'packing' => 'Packing',
            'shipped' => 'Shipped',
            'transit' => 'In Transit',
            'delivered' => 'Delivered',
        ],
        'financial_status' => [
            'unpaid' => 'Unpaid',
            'paid' => 'Paid',
            'partial_paid' => 'Partial',
            'refunded' => 'Refunded',
        ],
        'actions' => [
            'view' => 'View',
            'open_menu' => 'Open menu',
        ],
        'bulk' => [
            'selected' => 'selected',
            'clear_selection' => 'Clear selection',
        ],
        'filters' => [
            'search_placeholder' => 'Search by order number...',
            'all_statuses' => 'All statuses',
            'all_payments' => 'All payments',
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
        'empty' => 'No orders found.',
    ],

    'order_show' => [
        'title' => 'Order Details',
        'back' => 'Back to Orders',
        'sections' => [
            'customer' => 'Customer Information',
            'items' => 'Order Items',
            'shipping' => 'Shipping Information',
            'timeline' => 'Order History',
        ],
        'customer' => [
            'name' => 'Name',
            'email' => 'Email',
            'phone' => 'Phone',
            'no_customer' => 'No customer information',
        ],
        'items' => [
            'product' => 'Product',
            'variant' => 'Variant',
            'quantity' => 'Qty',
            'price' => 'Price',
            'total' => 'Total',
            'no_items' => 'No items in this order',
        ],
        'shipping' => [
            'name' => 'Recipient',
            'phone' => 'Phone',
            'note' => 'Note',
            'no_shipping' => 'No shipping information',
        ],
        'timeline' => [
            'event' => [
                'created' => 'Created',
                'updated' => 'Updated',
                'deleted' => 'Deleted',
            ],
            'by' => 'by',
            'system' => 'System',
            'no_history' => 'No history available',
        ],
        'totals' => [
            'subtotal' => 'Subtotal',
            'total' => 'Total',
        ],
        'note' => 'Note',
        'no_note' => 'No note',
        'created_at' => 'Created',
        'updated_at' => 'Updated',
        'status_updated' => 'Status updated successfully',
        'status_update_failed' => 'Failed to update status',
    ],

    'image_upload' => [
        'title' => 'Upload Images',
        'description' => 'Upload new images to your product',
        'select_or_drop' => 'Click to select or drag & drop files here',
        'max_files' => 'Maximum :max files',
        'files_selected' => ':count file(s) selected',
        'selected_files' => 'Selected files',
    ],

    'media_picker' => [
        'title' => 'Select Images',
        'description_multiple' => 'Select one or more images from your media library',
        'description_single' => 'Select an image from your media library',
        'search_placeholder' => 'Search images...',
        'no_results' => 'No images found matching your search',
        'no_images' => 'No images in your media library',
        'select_button' => 'Select (:count)',
    ],

    'product_images_picker' => [
        'title' => 'Select Product Image',
        'description' => 'Choose an image from the product\'s images',
        'no_images' => 'No images for this product',
        'add_images_first' => 'Add images to the product first',
        'position' => 'Position',
        'main' => 'Main',
        'select_button' => 'Select Image',
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
        'deleting' => 'Deleting...',
        'upload' => 'Upload',
        'uploading' => 'Uploading...',
        'save' => 'Save',
        'saving' => 'Saving...',
    ],

    'pagination' => [
        'previous' => 'Previous',
        'next' => 'Next',
        'page_of' => 'Page :current of :total',
        'showing' => 'Showing :from to :to of :total',
    ],

    'brand_requests' => [
        'title' => 'Brand Requests',
        'description' => 'Manage brand creation requests',
    ],

    'brand_requests_table' => [
        'columns' => [
            'id' => 'ID',
            'email' => 'Email',
            'phone' => 'Phone',
            'name' => 'Name',
            'brand_name' => 'Brand Name',
            'status' => 'Status',
            'created' => 'Created',
        ],
        'status' => [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
        ],
        'actions' => [
            'view' => 'View',
            'open_menu' => 'Open menu',
        ],
        'bulk' => [
            'selected' => 'selected',
            'clear_selection' => 'Clear selection',
        ],
        'filters' => [
            'search_placeholder' => 'Search by email or name...',
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
        'empty' => 'No brand requests found.',
    ],

    'brand_request_show' => [
        'title' => 'Brand Request',
        'sections' => [
            'request_info' => 'Request Information',
            'status_info' => 'Status Information',
            'linked_entities' => 'Linked Entities',
        ],
        'fields' => [
            'email' => 'Email',
            'phone' => 'Phone',
            'name' => 'Contact Name',
            'brand_name' => 'Requested Brand Name',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'approved_at' => 'Approved At',
            'rejected_at' => 'Rejected At',
            'reviewed_by' => 'Reviewed By',
            'rejection_reason' => 'Rejection Reason',
            'created_user' => 'Created User',
            'created_brand' => 'Created Brand',
        ],
        'actions' => [
            'approve' => 'Approve',
            'reject' => 'Reject',
        ],
        'reject_modal' => [
            'title' => 'Reject Brand Request',
            'description' => 'Please provide a reason for rejecting this brand request. This will be visible to the applicant.',
            'reason_label' => 'Rejection Reason',
            'reason_placeholder' => 'Enter the reason for rejection...',
            'cancel' => 'Cancel',
            'confirm' => 'Reject Request',
        ],
    ],

    'brands' => [
        'title' => 'Brands',
        'description' => 'Manage brands',
        'actions' => [
            'create' => 'Create Brand',
        ],
    ],

    'brands_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Name',
            'owner' => 'Owner',
            'products' => 'Products',
            'created' => 'Created',
        ],
        'actions' => [
            'edit' => 'Edit',
            'delete' => 'Delete',
            'open_menu' => 'Open menu',
        ],
        'bulk' => [
            'selected' => 'selected',
            'delete_selected' => 'Delete Selected',
            'clear_selection' => 'Clear selection',
        ],
        'filters' => [
            'search_placeholder' => 'Search by name...',
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
        'empty' => 'No brands found.',
        'confirm' => [
            'delete_one' => 'Are you sure you want to delete',
            'delete_many' => 'Are you sure you want to delete',
            'brands' => 'brand(s)?',
        ],
        'success' => [
            'deleted' => 'Brand deleted successfully',
            'bulk_deleted' => 'Brands deleted successfully',
        ],
        'errors' => [
            'delete_failed' => 'Failed to delete brand',
            'bulk_delete_failed' => 'Failed to delete brands',
        ],
    ],

    'brands_edit' => [
        'title' => 'Edit Brand',
        'description' => 'Update brand information',
        'fields' => [
            'name' => 'Name',
            'description' => 'Description',
        ],
        'placeholders' => [
            'name' => 'Enter brand name',
            'description' => 'Enter brand description...',
        ],
        'required_fields' => 'Required fields',
        'actions' => [
            'cancel' => 'Cancel',
            'save' => 'Save Changes',
            'saving' => 'Saving...',
        ],
    ],

    'brands_create' => [
        'title' => 'Create Brand',
        'description' => 'Add a new brand',
        'actions' => [
            'create' => 'Create Brand',
            'creating' => 'Creating...',
        ],
    ],
];
