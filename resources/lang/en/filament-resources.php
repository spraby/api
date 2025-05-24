<?php

return [
    'resources' => [
        'order' => [
            'label' => 'Order',
            'plural_label' => 'Orders',
            'navigation_label' => 'Orders',
            'sections' => [
                'general' => 'General Information',
                'status' => 'Status',
                'associations' => 'Associations',
            ],
            'fields' => [
                'name' => 'Name',
                'note' => 'Note',
                'status' => 'Status',
                'delivery_status' => 'Delivery Status',
                'financial_status' => 'Financial Status',
                'customer_id' => 'Customer',
                'brand_id' => 'Brand',
                'items_count' => 'Items Count',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
            ],
            'filters' => [
                'has_items' => 'Has Items',
                'has_shipping' => 'Has Shipping',
            ],
            'relations' => [
                'items' => [
                    'label' => 'Order Item',
                    'plural_label' => 'Order Items',
                    'fields' => [
                        'product_id' => 'Product',
                        'quantity' => 'Quantity',
                        'price' => 'Price',
                        'options' => 'Options',
                        'created_at' => 'Created At',
                    ],
                ],
                'shippings' => [
                    'label' => 'Shipping',
                    'plural_label' => 'Shippings',
                    'fields' => [
                        'tracking_number' => 'Tracking Number',
                        'status' => 'Status',
                        'carrier' => 'Carrier',
                        'address' => 'Address',
                        'notes' => 'Notes',
                        'created_at' => 'Created At',
                        'updated_at' => 'Updated At',
                    ],
                ],
            ],
            'pages' => [
                'stats' => [
                    'title' => 'Order Statistics',
                    'back' => 'Back to List',
                    'sections' => [
                        'general' => 'General Statistics',
                        'total_orders' => 'Total Orders:',
                        'order_statuses' => 'Order Statuses',
                        'delivery_statuses' => 'Delivery Statuses',
                        'financial_statuses' => 'Financial Statuses',
                        'orders_by_month' => 'Orders by Month',
                        'orders_by_brand' => 'Orders by Brand',
                    ],
                    'statuses' => [
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'archived' => 'Archived',
                        'packing' => 'Packing',
                        'shipped' => 'Shipped',
                        'transit' => 'In Transit',
                        'delivered' => 'Delivered',
                        'unpaid' => 'Unpaid',
                        'paid' => 'Paid',
                        'partial_paid' => 'Partially Paid',
                        'refunded' => 'Refunded',
                    ],
                    'months' => [
                        '1' => 'January',
                        '2' => 'February',
                        '3' => 'March',
                        '4' => 'April',
                        '5' => 'May',
                        '6' => 'June',
                        '7' => 'July',
                        '8' => 'August',
                        '9' => 'September',
                        '10' => 'October',
                        '11' => 'November',
                        '12' => 'December',
                    ],
                ],
                'view' => [
                    'title' => 'View Order',
                ],
                'edit' => [
                    'title' => 'Edit Order',
                    'view' => 'View',
                ],
            ],
        ],
        'category' => [
            'label' => 'Category',
            'plural_label' => 'Categories',
            'navigation_label' => 'Categories',
            'fields' => [
                'handle' => 'Handle',
                'name' => 'Name',
                'title' => 'Title',
                'description' => 'Description',
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
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
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
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
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
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
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
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
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
                'products_count' => 'Products count',
                'orders_count' => 'Orders count',
            ],
            'relations' => [
                'users' => [
                    'label' => 'User',
                    'plural_label' => 'Users',
                ],
                'products' => [
                    'label' => 'Product',
                    'plural_label' => 'Products',
                    'fields' => [
                        'name' => 'Name',
                        'price' => 'Price',
                        'description' => 'Description',
                        'variants_count' => 'Variants count',
                    ],
                    'filters' => [
                        'has_variants' => 'With variants',
                        'has_images' => 'With images',
                    ],
                ],
                'categories' => [
                    'label' => 'Category',
                    'plural_label' => 'Categories',
                    'fields' => [
                        'name' => 'Name',
                        'description' => 'Description',
                        'parent_id' => 'Parent category',
                    ],
                ],
                'orders' => [
                    'label' => 'Order',
                    'plural_label' => 'Orders',
                    'fields' => [
                        'number' => 'Number',
                        'total' => 'Total',
                        'status' => 'Status',
                        'customer' => 'Customer',
                        'items_count' => 'Items count',
                    ],
                    'statuses' => [
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ],
                    'filters' => [
                        'has_shipping' => 'With shipping',
                    ],
                ],
                'images' => [
                    'label' => 'Image',
                    'plural_label' => 'Images',
                    'fields' => [
                        'path' => 'Image',
                        'alt' => 'Alt text',
                        'type' => 'Type',
                    ],
                    'types' => [
                        'logo' => 'Logo',
                        'banner' => 'Banner',
                        'gallery' => 'Gallery',
                    ],
                ],
                'settings' => [
                    'label' => 'Setting',
                    'plural_label' => 'Settings',
                    'fields' => [
                        'type' => 'Type',
                        'data' => 'Data',
                        'key' => 'Key',
                        'value' => 'Value',
                    ],
                    'types' => [
                        'delivery' => 'Delivery',
                        'refund' => 'Refund',
                        'phones' => 'Phones',
                        'emails' => 'Emails',
                        'socials' => 'Social media',
                        'addresses' => 'Addresses',
                    ],
                    'actions' => [
                        'add' => 'Add setting',
                    ],
                    'items' => 'items',
                ],
            ],
            'filters' => [
                'has_description' => 'With description',
                'has_products' => 'With products',
                'has_orders' => 'With orders',
            ],
        ],
        'user' => [
            'label' => 'User',
            'plural_label' => 'Users',
            'navigation_label' => 'Users',
            'fields' => [
                'first_name' => 'First name',
                'last_name' => 'Last name',
                'email' => 'Email',
                'password' => 'Password',
                'role' => 'Role',
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
            ],
            'relations' => [
                'brands' => [
                    'label' => 'Brand',
                    'plural_label' => 'Brands',
                ],
            ],
        ],
        'product' => [
            'label' => 'Product',
            'plural_label' => 'Products',
            'navigation_label' => 'Products',
            'sections' => [
                'general' => 'General information',
                'pricing' => 'Pricing',
                'status' => 'Status',
                'associations' => 'Associations',
            ],
            'fields' => [
                'title' => 'Title',
                'description' => 'Description',
                'price' => 'Price',
                'final_price' => 'Final price',
                'enabled' => 'Enabled',
                'brand_id' => 'Brand',
                'category_id' => 'Category',
                'variants_count' => 'Variants count',
                'created_at' => 'Created at',
                'updated_at' => 'Updated at',
            ],
            'filters' => [
                'has_variants' => 'With variants',
                'has_images' => 'With images',
                'has_orders' => 'With orders',
            ],
            'relations' => [
                'variants' => [
                    'label' => 'Variant',
                    'plural_label' => 'Variants',
                    'sections' => [
                        'options' => 'Options',
                    ],
                    'fields' => [
                        'title' => 'Title',
                        'price' => 'Price',
                        'final_price' => 'Final price',
                        'image_id' => 'Image',
                        'values' => 'Values',
                        'values_count' => 'Values count',
                        'option_id' => 'Option',
                        'option_value_id' => 'Value',
                    ],
                    'filters' => [
                        'has_image' => 'With image',
                        'has_values' => 'With values',
                    ],
                ],
                'images' => [
                    'label' => 'Product image',
                    'plural_label' => 'Product images',
                    'fields' => [
                        'image_id' => 'Image',
                        'name' => 'Name',
                        'src' => 'File',
                        'alt' => 'Alt text',
                        'preview' => 'Preview',
                        'position' => 'Position',
                        'variants_count' => 'Variants count',
                    ],
                    'filters' => [
                        'has_variants' => 'With variants',
                    ],
                ],
                'order_items' => [
                    'label' => 'Order item',
                    'plural_label' => 'Order items',
                    'fields' => [
                        'order_id' => 'Order',
                        'variant_id' => 'Variant',
                        'quantity' => 'Quantity',
                        'price' => 'Price',
                        'total' => 'Total',
                    ],
                    'filters' => [
                        'has_variant' => 'With variant',
                    ],
                ],
            ],
        ],
    ],
];
