<?php

return [
    'pages' => [
        'dashboard' => [
            'title' => 'Spraby Dashboard',
        ],
    ],

    'resources' => [
        'label' => 'Resources',
        'title' => 'Resources',
    ],

    'navigation' => [
        'groups' => [
            'Shop' => 'Shop',
            'Users' => 'Users',
            'Settings' => 'Settings',
        ],
    ],

    'widgets' => [
        'account' => [
            'label' => 'Account',
            'actions' => [
                'edit_profile' => [
                    'label' => 'Edit Profile',
                ],
            ],
        ],
    ],

    'auth' => [
        'title' => 'Authentication',
        'heading' => 'Sign In',
        'actions' => [
            'login' => [
                'label' => 'Login',
            ],
            'logout' => [
                'label' => 'Logout',
            ],
        ],
        'fields' => [
            'email' => [
                'label' => 'Email',
            ],
            'password' => [
                'label' => 'Password',
            ],
            'remember' => [
                'label' => 'Remember Me',
            ],
        ],
        'messages' => [
            'failed' => 'Invalid credentials.',
        ],
    ],

    'layout' => [
        'direction' => 'ltr',
        'sidebar' => [
            'collapse' => [
                'label' => 'Collapse sidebar',
            ],
            'expand' => [
                'label' => 'Expand sidebar',
            ],
        ],
        'language' => 'Language',
    ],
];
