<?php

return [
    'resources' => [
        'order' => [
            'label' => 'Заказ',
            'plural_label' => 'Заказы',
            'navigation_label' => 'Заказы',
            'sections' => [
                'general' => 'Основная информация',
                'status' => 'Статус',
                'associations' => 'Связи',
            ],
            'fields' => [
                'name' => 'Название',
                'note' => 'Примечание',
                'status' => 'Статус',
                'delivery_status' => 'Статус доставки',
                'financial_status' => 'Финансовый статус',
                'customer_id' => 'Клиент',
                'brand_id' => 'Бренд',
                'items_count' => 'Количество товаров',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'filters' => [
                'has_items' => 'С товарами',
                'has_shipping' => 'С доставкой',
            ],
            'relations' => [
                'items' => [
                    'label' => 'Товар заказа',
                    'plural_label' => 'Товары заказа',
                    'fields' => [
                        'product_id' => 'Товар',
                        'quantity' => 'Количество',
                        'price' => 'Цена',
                        'options' => 'Опции',
                        'created_at' => 'Создано',
                    ],
                ],
                'shippings' => [
                    'label' => 'Доставка',
                    'plural_label' => 'Доставки',
                    'fields' => [
                        'tracking_number' => 'Номер отслеживания',
                        'status' => 'Статус',
                        'carrier' => 'Перевозчик',
                        'address' => 'Адрес',
                        'notes' => 'Примечания',
                        'created_at' => 'Создано',
                        'updated_at' => 'Обновлено',
                    ],
                ],
            ],
            'pages' => [
                'stats' => [
                    'title' => 'Статистика заказов',
                    'back' => 'Назад к списку',
                    'sections' => [
                        'general' => 'Общая статистика',
                        'total_orders' => 'Всего заказов:',
                        'order_statuses' => 'Статусы заказов',
                        'delivery_statuses' => 'Статусы доставки',
                        'financial_statuses' => 'Финансовые статусы',
                        'orders_by_month' => 'Заказы по месяцам',
                        'orders_by_brand' => 'Заказы по брендам',
                    ],
                    'statuses' => [
                        'pending' => 'Ожидает',
                        'confirmed' => 'Подтвержден',
                        'processing' => 'В обработке',
                        'completed' => 'Завершен',
                        'cancelled' => 'Отменен',
                        'archived' => 'Архивирован',
                        'packing' => 'Упаковка',
                        'shipped' => 'Отправлен',
                        'transit' => 'В пути',
                        'delivered' => 'Доставлен',
                        'unpaid' => 'Не оплачен',
                        'paid' => 'Оплачен',
                        'partial_paid' => 'Частично оплачен',
                        'refunded' => 'Возвращен',
                    ],
                    'months' => [
                        '1' => 'Январь',
                        '2' => 'Февраль',
                        '3' => 'Март',
                        '4' => 'Апрель',
                        '5' => 'Май',
                        '6' => 'Июнь',
                        '7' => 'Июль',
                        '8' => 'Август',
                        '9' => 'Сентябрь',
                        '10' => 'Октябрь',
                        '11' => 'Ноябрь',
                        '12' => 'Декабрь',
                    ],
                ],
                'view' => [
                    'title' => 'Просмотр заказа',
                ],
                'edit' => [
                    'title' => 'Редактирование заказа',
                    'view' => 'Просмотр',
                ],
            ],
        ],
        'category' => [
            'label' => 'Категория',
            'plural_label' => 'Категории',
            'navigation_label' => 'Категории',
            'fields' => [
                'handle' => 'Идентификатор (url)',
                'name' => 'Название',
                'title' => 'Заголовок',
                'header' => 'H1',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'headings' => [
                'details' => 'Детали',
                'relationships' => 'Связи',
            ],
            'relations' => [
                'collections' => [
                    'label' => 'Коллекции',
                    'plural_label' => 'Коллекции',
                ],
                'options' => [
                    'label' => 'Опция',
                    'plural_label' => 'Опции',
                ],
                'brands' => [
                    'label' => 'Бренд',
                    'plural_label' => 'Бренды',
                ],
                'products' => [
                    'label' => 'Товар',
                    'plural_label' => 'Товары',
                ],
            ],
        ],
        'collection' => [
            'label' => 'Коллекция',
            'plural_label' => 'Коллекции',
            'navigation_label' => 'Коллекции',
            'fields' => [
                'handle' => 'Идентификатор',
                'name' => 'Название',
                'title' => 'Заголовок',
                'header' => 'H1',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'categories' => [
                    'label' => 'Категория',
                    'plural_label' => 'Категории',
                ],
            ],
        ],
        'option' => [
            'label' => 'Опция',
            'plural_label' => 'Опции',
            'navigation_label' => 'Опции',
            'fields' => [
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'values' => [
                    'label' => 'Значение',
                    'plural_label' => 'Значения',
                ],
                'categories' => [
                    'label' => 'Категория',
                    'plural_label' => 'Категории',
                ],
            ],
        ],
        'option-value' => [
            'label' => 'Значение опции',
            'plural_label' => 'Значения опций',
            'navigation_label' => 'Значения опций',
            'fields' => [
                'option_id' => 'Опция',
                'value' => 'Значение',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
        ],
        'brand' => [
            'label' => 'Бренд',
            'plural_label' => 'Бренды',
            'navigation_label' => 'Бренды',
            'fields' => [
                'handle' => 'Идентификатор',
                'name' => 'Название',
                'title' => 'Заголовок',
                'description' => 'Описание',
                'settings' => [
                    'label' => 'Настройки',
                    'currency' => 'Валюта',
                    'contact_email' => 'Контактный email',
                    'contact_phone' => 'Контактный телефон',
                ],
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'users' => [
                    'label' => 'Пользователь',
                    'plural_label' => 'Пользователи',
                ],
                'products' => [
                    'label' => 'Товар',
                    'plural_label' => 'Товары',
                    'fields' => [
                        'name' => 'Название',
                        'price' => 'Цена',
                        'description' => 'Описание',
                        'variants_count' => 'Количество вариантов',
                    ],
                    'filters' => [
                        'has_variants' => 'С вариантами',
                        'has_images' => 'С изображениями',
                    ],
                ],
                'categories' => [
                    'label' => 'Категория',
                    'plural_label' => 'Категории',
                    'fields' => [
                        'name' => 'Название',
                        'description' => 'Описание',
                        'parent_id' => 'Родительская категория',
                    ],
                ],
                'orders' => [
                    'label' => 'Заказ',
                    'plural_label' => 'Заказы',
                    'fields' => [
                        'number' => 'Номер',
                        'total' => 'Сумма',
                        'status' => 'Статус',
                        'customer' => 'Клиент',
                        'items_count' => 'Количество товаров',
                    ],
                    'statuses' => [
                        'pending' => 'Ожидает',
                        'processing' => 'В обработке',
                        'completed' => 'Завершен',
                        'cancelled' => 'Отменен',
                    ],
                    'filters' => [
                        'has_shipping' => 'С доставкой',
                    ],
                ],
                'images' => [
                    'label' => 'Изображение',
                    'plural_label' => 'Изображения',
                    'fields' => [
                        'path' => 'Изображение',
                        'alt' => 'Альтернативный текст',
                        'type' => 'Тип',
                    ],
                    'types' => [
                        'logo' => 'Логотип',
                        'banner' => 'Баннер',
                        'gallery' => 'Галерея',
                    ],
                ],
                'settings' => [
                    'label' => 'Настройка',
                    'plural_label' => 'Настройки',
                    'fields' => [
                        'type' => 'Тип',
                        'data' => 'Данные',
                        'key' => 'Ключ',
                        'value' => 'Значение',
                    ],
                    'types' => [
                        'delivery' => 'Доставка',
                        'refund' => 'Возврат',
                        'phones' => 'Телефоны',
                        'emails' => 'Электронная почта',
                        'socials' => 'Социальные сети',
                        'addresses' => 'Адреса',
                    ],
                    'actions' => [
                        'add' => 'Добавить настройку',
                    ],
                    'items' => 'элементов',
                ],
            ],
            'filters' => [
                'has_description' => 'С описанием',
                'has_products' => 'С товарами',
                'has_orders' => 'С заказами',
            ],
        ],
        'user' => [
            'label' => 'Пользователь',
            'plural_label' => 'Пользователи',
            'navigation_label' => 'Пользователи',
            'fields' => [
                'first_name' => 'Имя',
                'last_name' => 'Фамилия',
                'email' => 'Email',
                'password' => 'Пароль',
                'role' => 'Роль',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'relations' => [
                'brands' => [
                    'label' => 'Бренд',
                    'plural_label' => 'Бренды',
                ],
            ],
        ],
        'product' => [
            'label' => 'Товар',
            'plural_label' => 'Товары',
            'navigation_label' => 'Товары',
            'sections' => [
                'general' => 'Основная информация',
                'pricing' => 'Цены',
                'status' => 'Статус',
                'associations' => 'Связи',
            ],
            'fields' => [
                'title' => 'Название',
                'description' => 'Описание',
                'price' => 'Цена',
                'final_price' => 'Итоговая цена',
                'enabled' => 'Активен',
                'brand_id' => 'Бренд',
                'category_id' => 'Категория',
                'variants_count' => 'Количество вариантов',
                'created_at' => 'Создано',
                'updated_at' => 'Обновлено',
            ],
            'filters' => [
                'has_variants' => 'С вариантами',
                'has_images' => 'С изображениями',
                'has_orders' => 'С заказами',
            ],
            'relations' => [
                'variants' => [
                    'label' => 'Вариант',
                    'plural_label' => 'Варианты',
                    'sections' => [
                        'options' => 'Опции',
                    ],
                    'fields' => [
                        'title' => 'Название',
                        'price' => 'Цена',
                        'final_price' => 'Итоговая цена',
                        'image_id' => 'Изображение',
                        'values' => 'Значения',
                        'values_count' => 'Количество значений',
                        'option_id' => 'Опция',
                        'option_value_id' => 'Значение',
                    ],
                    'filters' => [
                        'has_image' => 'С изображением',
                        'has_values' => 'С значениями',
                    ],
                ],
                'images' => [
                    'label' => 'Изображение товара',
                    'plural_label' => 'Изображения товара',
                    'fields' => [
                        'image_id' => 'Изображение',
                        'name' => 'Название',
                        'src' => 'Файл',
                        'alt' => 'Альтернативный текст',
                        'preview' => 'Предпросмотр',
                        'position' => 'Позиция',
                        'variants_count' => 'Количество вариантов',
                    ],
                    'filters' => [
                        'has_variants' => 'С вариантами',
                    ],
                ],
                'order_items' => [
                    'label' => 'Позиция заказа',
                    'plural_label' => 'Позиции заказов',
                    'fields' => [
                        'order_id' => 'Заказ',
                        'variant_id' => 'Вариант',
                        'quantity' => 'Количество',
                        'price' => 'Цена',
                        'total' => 'Сумма',
                    ],
                    'filters' => [
                        'has_variant' => 'С вариантом',
                    ],
                ],
            ],
        ],
    ],
];
