<?php

return [
    'nav' => [
        'dashboard' => 'Панель управления',
        'users' => 'Пользователи',
        'products' => 'Товары',
        'orders' => 'Заказы',
        'media' => 'Медиатека',
        'categories' => 'Категории',
        'collections' => 'Коллекции',
        'options' => 'Опции',
        'brands' => 'Бренды',
        'settings' => 'Настройки',
        'documents' => 'Документы',
        'brand_requests' => 'Заявки',
    ],

    'user' => [
        'account' => 'Аккаунт',
        'logout' => 'Выйти',
    ],

    'theme' => [
        'light' => 'Светлая',
        'dark' => 'Тёмная',
        'system' => 'Системная',
        'toggle' => 'Переключить тему',
    ],

    'language' => [
        'switch' => 'Переключить язык',
        'russian' => 'Русский',
        'english' => 'English',
    ],

    'users' => [
        'title' => 'Пользователи',
        'description' => 'Управление пользователями и их правами',
    ],

    'users_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Имя',
            'role' => 'Роль',
            'created' => 'Создан',
            'created_at' => 'Создан',
        ],
        'roles' => [
            'user' => 'Пользователь',
            'admin' => 'Администратор',
            'manager' => 'Менеджер',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'change_role' => 'Изменить роль...',
            'update_role' => 'Обновить роль',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по имени или email...',
            'all_roles' => 'Все роли',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Пользователи не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'users' => 'пользователей?',
        ],
        'messages' => [
            'deleted_success' => 'Пользователь удалён успешно',
            'deleted_failed' => 'Не удалось удалить пользователя',
            'deleted_many_success' => 'Успешно удалено',
            'deleted_many_users' => 'пользователей',
            'deleted_many_failed' => 'Не удалось удалить пользователей',
            'role_updated_success' => 'Роль обновлена для',
            'role_updated_users' => 'пользователей',
            'role_updated_failed' => 'Не удалось обновить роли',
        ],
    ],

    'users_edit' => [
        'title' => 'Редактирование пользователя',
        'description' => 'Изменение информации и прав пользователя',
        'fields' => [
            'first_name' => 'Имя',
            'last_name' => 'Фамилия',
            'email' => 'Email',
            'role' => 'Роль',
        ],
        'placeholders' => [
            'first_name' => 'Введите имя',
            'last_name' => 'Введите фамилию',
            'email' => 'user@example.com',
            'role' => 'Выберите роль',
        ],
        'roles' => [
            'none' => 'Пользователь (без роли)',
            'admin' => 'Администратор',
            'manager' => 'Менеджер',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'cancel' => 'Отмена',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
        ],
        'messages' => [
            'update_failed' => 'Не удалось обновить пользователя. Проверьте форму на наличие ошибок.',
        ],
        'brands' => [
            'title' => 'Бренды',
        ],
    ],

    'dashboard' => [
        'title' => 'Панель управления',
        'period' => 'Последние :days дней • :start — :end',
        'range_days' => ':days дней',
        'kpi' => [
            'revenue' => 'Выручка',
            'orders' => 'Заказы',
            'aov' => 'Средний чек',
            'units' => 'Продано единиц',
            'views' => 'Просмотры',
            'add_to_cart' => 'Добавления в корзину',
            'conversion_view_to_atc' => 'Просмотр → В корзину',
            'conversion_view_to_order' => 'Просмотр → Заказ',
        ],
        'charts' => [
            'toggle_sales' => 'Продажи',
            'toggle_interest' => 'Интерес',
            'sales_title' => 'Продажи по дням',
            'sales_description' => 'Выручка и количество заказов',
            'interest_title' => 'Интерес к товарам',
            'interest_description' => 'Просмотры, клики и добавления в корзину',
        ],
        'tables' => [
            'top_title' => 'Топ товаров по продажам',
            'top_description' => 'Лидеры по выручке за период',
            'gap_title' => 'Топ конверсии',
            'gap_description' => 'Товары с наивысшей конверсией за период',
            'toggle_top' => 'Топ продаж',
            'toggle_gap' => 'Топ конверсии',
            'headers' => [
                'product' => 'Товар',
                'revenue' => 'Выручка',
                'orders' => 'Заказы',
                'ordered' => 'Заказали',
                'units' => 'Шт.',
                'views' => 'Просмотры',
                'add_to_cart' => 'В корзину',
                'added_to_cart' => 'Добавили в корзину',
                'conversion' => 'Просмотр → Заказ',
                'gap_views' => 'Просмотры',
                'gap_orders' => 'Заказы',
                'gap_conversion' => 'Конверсия',
                'view_to_cart' => 'Просмотр → В корзину',
                'view_to_order' => 'Просмотр → Заказ',
                'cart_to_order' => 'В корзину → Заказ',
            ],
            'pagination' => [
                'page_of' => 'Страница :page из :pages',
                'first' => 'Первая',
                'previous' => 'Предыдущая',
                'next' => 'Следующая',
                'last' => 'Последняя',
            ],
            'empty' => 'Нет данных за выбранный период',
        ],
        'labels' => [
            'no_category' => 'Без категории',
        ],
        'tooltip' => [
            'revenue' => 'Выручка',
            'orders' => 'Заказы',
            'views' => 'Просмотры',
            'clicks' => 'Клики',
            'add_to_cart' => 'В корзину',
        ],
        'orders_widget' => [
            'title' => 'Актуальность статусов',
            'description' => 'Показывает, где застряли заказы и что требует внимания',
            'health_label' => 'Свежесть статусов',
            'active_total' => ':count активных заказов',
            'needs_attention' => ':count требуют внимания',
            'unpaid_total' => 'Не оплачено',
            'unpaid_count' => 'Не оплачено заказов: :count',
            'paid_total' => 'Оплачено',
            'paid_count' => 'Оплачено заказов: :count',
            'no_statuses' => 'Нет заказов за выбранный период',
            'cta' => 'Перейти к заказам',
            'attention' => [
                'pending' => 'Ожидает/подтверждён > :days дн.',
                'processing' => 'В обработке > :days дн.',
                'unpaid' => 'Не оплачен > :days дн.',
            ],
        ],
        'errors' => [
            'title' => 'Недостаточно данных',
            'no_brand' => 'Нет бренда, связанного с пользователем',
        ],
    ],

    'products' => [
        'title' => 'Товары',
        'description' => 'Управление каталогом товаров',
        'actions' => [
            'create' => 'Создать товар',
        ],
    ],

    'products_table' => [
        'columns' => [
            'title' => 'Название',
            'status' => 'Статус',
            'price' => 'Цена',
            'created' => 'Создан',
        ],
        'status' => [
            'enabled' => 'Активен',
            'disabled' => 'Неактивен',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'change_status' => 'Изменить статус...',
            'update_status' => 'Обновить статус',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по названию...',
            'all_statuses' => 'Все статусы',
            'columns' => 'Колонки',
            'price_from' => 'Цена от',
            'price_to' => 'Цена до',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Товары не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'products' => 'товаров?',
        ],
        'success' => [
            'deleted' => 'Товар успешно удалён',
            'bulk_deleted' => 'Товары успешно удалены',
            'status_updated' => 'Статус товаров успешно обновлён',
        ],
        'errors' => [
            'delete_failed' => 'Не удалось удалить товар',
            'bulk_delete_failed' => 'Не удалось удалить товары',
            'status_update_failed' => 'Не удалось обновить статус товаров',
        ],
    ],

    'products_edit' => [
        'title' => 'Редактирование товара',
        'description' => 'Изменение информации о товаре и его вариантах',
        'sections' => [
            'product_info' => 'Информация о товаре',
            'product_images' => 'Изображения товара',
            'variants' => 'Варианты товара',
        ],
        'no_images' => 'Нет загруженных изображений для этого товара',
        'images' => [
            'add_from_media' => 'Добавить из медиатеки',
            'upload_new' => 'Загрузить новые',
            'add_images' => 'Добавить изображения',
            'no_images' => 'Нет изображений для этого товара',
            'position' => 'Позиция',
            'main' => 'Главное',
            'confirm_delete' => 'Отвязать это изображение от товара? Оно останется в медиатеке.',
        ],
        'variants' => [
            'confirm_remove_image' => 'Удалить изображение из этого варианта?',
        ],
        'variant_options' => [
            'title' => 'Значения опций',
            'select_placeholder' => 'Выберите значение',
        ],
        'fields' => [
            'title' => 'Название',
            'description' => 'Описание',
            'category' => 'Категория',
            'price' => 'Цена',
            'final_price' => 'Финальная цена',
            'enabled' => 'Товар активен',
            'variant_title' => 'Название варианта',
            'variant_enabled' => 'Вариант активен',
            'variant_image' => 'Изображение варианта',
        ],
        'placeholders' => [
            'title' => 'Введите название товара',
            'description' => 'Введите описание товара...',
            'category' => 'Выберите категорию',
            'price' => '0.00',
            'final_price' => '0.00',
            'variant_title' => 'например, Маленький, Средний, Красный, и т.д.',
        ],
        'category' => [
            'none' => 'Без категории',
            'not_in_list' => 'Категория не находится в списке категорий бренда. Невозможно редактировать этот товар.',
            'locked' => 'Категорию нельзя изменить после создания товара',
        ],
        'variant' => 'Вариант',
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'back' => 'Назад к товарам',
            'add_variant' => 'Добавить вариант',
            'cancel' => 'Отмена',
            'discard' => 'Отменить',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
            'select_image' => 'Выбрать изображение',
            'change_image' => 'Изменить изображение',
        ],
        'unsaved' => [
            'message' => 'Есть несохранённые изменения',
            'mobile_message' => 'Не сохранено',
            'dialog' => [
                'title' => 'Несохранённые изменения',
                'description' => 'У вас есть несохранённые изменения. Что вы хотите сделать?',
                'save' => 'Сохранить и уйти',
                'discard' => 'Отменить изменения',
                'cancel' => 'Остаться на странице',
            ],
        ],
        'errors' => [
            'at_least_one_variant' => 'У товара должен быть хотя бы один вариант',
            'save_variant_first' => 'Пожалуйста, сначала сохраните товар, чтобы добавить изображения для вариантов',
            'image_not_attached' => 'Это изображение не прикреплено к товару. Сначала прикрепите его.',
            'all_combinations_used' => 'Все возможные комбинации опций уже использованы. Невозможно добавить больше вариантов.',
            'duplicate_variants' => 'Невозможно сохранить товар с дублирующимися вариантами. Убедитесь, что каждый вариант имеет уникальную комбинацию опций.',
        ],
        'hints' => [
            'save_to_add_image' => 'Сохраните товар, чтобы добавить изображения',
        ],
        'success' => [
            'saved' => 'Товар успешно сохранён',
        ],
        'duplicate_variants' => [
            'title' => 'Обнаружены дублирующиеся варианты',
            'description' => 'Следующие варианты имеют одинаковые значения опций. Каждый вариант должен иметь уникальную комбинацию опций.',
            'group_label' => 'Варианты',
        ],
    ],

    'products_create' => [
        'title' => 'Создание товара',
        'description' => 'Добавление нового товара в каталог',
        'sections' => [
            'product_info' => 'Информация о товаре',
        ],
        'fields' => [
            'title' => 'Название',
            'description' => 'Описание',
            'category' => 'Категория',
            'price' => 'Цена',
            'final_price' => 'Финальная цена',
            'enabled' => 'Товар активен',
            'variant_title' => 'Название варианта',
            'variant_enabled' => 'Вариант активен',
        ],
        'placeholders' => [
            'title' => 'Введите название товара',
            'description' => 'Введите описание товара...',
            'category' => 'Выберите категорию',
            'price' => '0.00',
            'final_price' => '0.00',
            'variant_title' => 'например, Маленький, Средний, Красный, и т.д.',
        ],
        'category' => [
            'none' => 'Без категории',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'back' => 'Назад к товарам',
            'add_variant' => 'Добавить вариант',
            'cancel' => 'Отмена',
            'create' => 'Создать товар',
            'creating' => 'Создание...',
        ],
        'errors' => [
            'at_least_one_variant' => 'У товара должен быть хотя бы один вариант',
            'all_combinations_used' => 'Все возможные комбинации опций уже использованы. Невозможно добавить больше вариантов.',
        ],
        'success' => [
            'created' => 'Товар успешно создан',
        ],
        'duplicate_variants' => [
            'title' => 'Обнаружены дублирующиеся варианты',
            'description' => 'Следующие варианты имеют одинаковые значения опций. Каждый вариант должен иметь уникальную комбинацию опций.',
            'group_label' => 'Варианты',
        ],
    ],

    'orders' => [
        'title' => 'Заказы',
        'description' => 'Управление заказами клиентов',
    ],

    'orders_table' => [
        'columns' => [
            'order' => 'Заказ',
            'customer' => 'Клиент',
            'total' => 'Сумма',
            'status' => 'Статус',
            'delivery' => 'Доставка',
            'payment' => 'Оплата',
            'created' => 'Создан',
        ],
        'items' => 'товар(ов)',
        'status' => [
            'pending' => 'Ожидает',
            'confirmed' => 'Подтверждён',
            'processing' => 'В обработке',
            'completed' => 'Выполнен',
            'cancelled' => 'Отменён',
            'archived' => 'Архив',
        ],
        'delivery_status' => [
            'pending' => 'Ожидает',
            'packing' => 'Упаковка',
            'shipped' => 'Отправлен',
            'transit' => 'В пути',
            'delivered' => 'Доставлен',
        ],
        'financial_status' => [
            'unpaid' => 'Не оплачен',
            'paid' => 'Оплачен',
            'partial_paid' => 'Частично',
            'refunded' => 'Возврат',
        ],
        'actions' => [
            'view' => 'Просмотр',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по номеру заказа...',
            'all_statuses' => 'Все статусы',
            'all_payments' => 'Все оплаты',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Заказы не найдены.',
    ],

    'order_show' => [
        'title' => 'Детали заказа',
        'back' => 'Назад к заказам',
        'sections' => [
            'customer' => 'Информация о клиенте',
            'items' => 'Товары заказа',
            'shipping' => 'Информация о доставке',
            'timeline' => 'История заказа',
        ],
        'customer' => [
            'name' => 'Имя',
            'email' => 'Email',
            'phone' => 'Телефон',
            'no_customer' => 'Нет информации о клиенте',
        ],
        'items' => [
            'product' => 'Товар',
            'variant' => 'Вариант',
            'quantity' => 'Кол-во',
            'price' => 'Цена',
            'total' => 'Итого',
            'no_items' => 'Нет товаров в заказе',
        ],
        'shipping' => [
            'name' => 'Получатель',
            'phone' => 'Телефон',
            'note' => 'Примечание',
            'no_shipping' => 'Нет информации о доставке',
        ],
        'timeline' => [
            'event' => [
                'created' => 'Создан',
                'updated' => 'Обновлён',
                'deleted' => 'Удалён',
            ],
            'by' => '',
            'system' => 'Система',
            'no_history' => 'История недоступна',
        ],
        'totals' => [
            'subtotal' => 'Подытог',
            'total' => 'Итого',
        ],
        'note' => 'Примечание',
        'no_note' => 'Нет примечания',
        'created_at' => 'Создан',
        'updated_at' => 'Обновлён',
        'status_updated' => 'Статус успешно обновлён',
        'status_update_failed' => 'Не удалось обновить статус',
    ],

    'image_upload' => [
        'title' => 'Загрузка изображений',
        'description' => 'Загрузите новые изображения для вашего товара',
        'select_or_drop' => 'Нажмите для выбора или перетащите файлы сюда',
        'max_files' => 'Максимум :max файлов',
        'files_selected' => 'Выбрано файлов: :count',
        'selected_files' => 'Выбранные файлы',
    ],

    'media_picker' => [
        'title' => 'Выбор изображений',
        'description_multiple' => 'Выберите одно или несколько изображений из медиатеки',
        'description_single' => 'Выберите изображение из медиатеки',
        'search_placeholder' => 'Поиск изображений...',
        'no_results' => 'Изображения не найдены',
        'no_images' => 'Нет изображений в медиатеке',
        'select_button' => 'Выбрать (:count)',
    ],

    'image_picker' => [
        'title' => 'Выбор изображений',
        'description' => 'Выберите существующие изображения или загрузите новые',
        'tab_library' => 'Медиатека',
        'tab_upload' => 'Загрузка',
        'search_placeholder' => 'Поиск изображений...',
        'no_results' => 'Изображения не найдены',
        'no_images' => 'Нет изображений в медиатеке',
        'select_button' => 'Выбрать (:count)',
        'select_or_drop' => 'Нажмите для выбора или перетащите файлы сюда',
        'max_files' => 'Максимум :max файлов',
        'files_selected' => 'Выбрано файлов: :count',
        'selected_files' => 'Выбранные файлы',
    ],

    'product_images_picker' => [
        'title' => 'Выбор изображения товара',
        'description' => 'Выберите изображение из изображений товара',
        'no_images' => 'Нет изображений для этого товара',
        'add_images_first' => 'Сначала добавьте изображения к товару',
        'position' => 'Позиция',
        'main' => 'Главное',
        'select_button' => 'Выбрать изображение',
    ],

    'media' => [
        'title' => 'Медиатека',
        'upload_button' => 'Загрузить изображения',
        'upload_dialog_title' => 'Загрузить изображения',
        'upload_dialog_description' => 'Выберите до 50 изображений для загрузки в медиатеку.',
        'select_files' => 'Нажмите для выбора файлов',
        'max_files' => 'Максимум 50 файлов, до 10 МБ каждый',
        'max_files_error' => 'Вы можете загрузить максимум 50 файлов за раз',
        'no_files_selected' => 'Пожалуйста, выберите файлы для загрузки',
        'files_selected' => 'Выбрано файлов: :count',
        'selected_files' => 'Выбранные файлы',
        'delete_confirm_title' => 'Удалить изображение',
        'delete_confirm_description' => 'Вы уверены, что хотите удалить это изображение? Это действие нельзя отменить.',
        'empty_title' => 'Нет изображений',
        'empty_description' => 'Загрузите ваши первые изображения, чтобы начать работу с медиатекой.',
        'upload_first_images' => 'Загрузить изображения',
    ],

    'common' => [
        'cancel' => 'Отмена',
        'delete' => 'Удалить',
        'deleting' => 'Удаление...',
        'upload' => 'Загрузить',
        'uploading' => 'Загрузка...',
        'save' => 'Сохранить',
        'saving' => 'Сохранение...',
    ],

    'pagination' => [
        'previous' => 'Предыдущая',
        'next' => 'Следующая',
        'page_of' => 'Страница :current из :total',
        'showing' => 'Показано с :from по :to из :total',
    ],

    'brand_requests' => [
        'title' => 'Заявки на бренд',
        'description' => 'Управление заявками на создание бренда',
    ],

    'brand_requests_table' => [
        'columns' => [
            'id' => 'ID',
            'email' => 'Email',
            'phone' => 'Телефон',
            'name' => 'Имя',
            'brand_name' => 'Название бренда',
            'status' => 'Статус',
            'created' => 'Создана',
        ],
        'status' => [
            'pending' => 'Ожидает',
            'approved' => 'Одобрена',
            'rejected' => 'Отклонена',
        ],
        'actions' => [
            'view' => 'Просмотр',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по email или имени...',
            'all_statuses' => 'Все статусы',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Заявки не найдены.',
    ],

    'brand_request_show' => [
        'title' => 'Заявка на бренд',
        'sections' => [
            'request_info' => 'Информация о заявке',
            'status_info' => 'Информация о статусе',
            'linked_entities' => 'Связанные объекты',
        ],
        'fields' => [
            'email' => 'Email',
            'phone' => 'Телефон',
            'name' => 'Контактное имя',
            'brand_name' => 'Запрашиваемое название бренда',
            'status' => 'Статус',
            'created_at' => 'Дата создания',
            'updated_at' => 'Дата обновления',
            'approved_at' => 'Дата одобрения',
            'rejected_at' => 'Дата отклонения',
            'reviewed_by' => 'Рассмотрел',
            'rejection_reason' => 'Причина отклонения',
            'created_user' => 'Созданный пользователь',
            'created_brand' => 'Созданный бренд',
        ],
        'actions' => [
            'approve' => 'Одобрить',
            'reject' => 'Отклонить',
        ],
        'reject_modal' => [
            'title' => 'Отклонение заявки',
            'description' => 'Укажите причину отклонения заявки. Эта информация будет видна заявителю.',
            'reason_label' => 'Причина отклонения',
            'reason_placeholder' => 'Введите причину отклонения...',
            'cancel' => 'Отмена',
            'confirm' => 'Отклонить заявку',
        ],
    ],

    'brands' => [
        'title' => 'Бренды',
        'description' => 'Управление брендами',
        'actions' => [
            'create' => 'Создать бренд',
        ],
    ],

    'brands_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Название',
            'owner' => 'Владелец',
            'products' => 'Товары',
            'created' => 'Создан',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по названию...',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Бренды не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'brands' => 'брендов?',
        ],
        'success' => [
            'deleted' => 'Бренд успешно удалён',
            'bulk_deleted' => 'Бренды успешно удалены',
        ],
        'errors' => [
            'delete_failed' => 'Не удалось удалить бренд',
            'bulk_delete_failed' => 'Не удалось удалить бренды',
        ],
    ],

    'brands_edit' => [
        'title' => 'Редактирование бренда',
        'description' => 'Изменение информации о бренде',
        'fields' => [
            'name' => 'Название',
            'description' => 'Описание',
        ],
        'placeholders' => [
            'name' => 'Введите название бренда',
            'description' => 'Введите описание бренда...',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'cancel' => 'Отмена',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
        ],
    ],

    'brands_create' => [
        'title' => 'Создание бренда',
        'description' => 'Добавление нового бренда',
        'actions' => [
            'create' => 'Создать бренд',
            'creating' => 'Создание...',
        ],
    ],

    'collections' => [
        'title' => 'Коллекции',
        'description' => 'Управление коллекциями товаров',
        'actions' => [
            'create' => 'Создать коллекцию',
        ],
    ],

    'collections_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Название',
            'title' => 'Заголовок',
            'categories' => 'Категории',
            'created' => 'Создана',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по названию...',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Коллекции не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'collections' => 'коллекций?',
        ],
        'success' => [
            'deleted' => 'Коллекция успешно удалена',
            'bulk_deleted' => 'Коллекции успешно удалены',
        ],
        'errors' => [
            'delete_failed' => 'Не удалось удалить коллекцию',
            'bulk_delete_failed' => 'Не удалось удалить коллекции',
        ],
    ],

    'collections_edit' => [
        'title' => 'Редактирование коллекции',
        'description' => 'Изменение информации о коллекции',
        'fields' => [
            'name' => 'Название',
            'handle' => 'Идентификатор',
            'title' => 'Заголовок',
            'header' => 'Шапка',
            'description' => 'Описание',
        ],
        'placeholders' => [
            'name' => 'Введите название коллекции',
            'handle' => 'например, letnyaya-rasprodazha',
            'title' => 'Введите заголовок коллекции',
            'header' => 'Введите шапку коллекции',
            'description' => 'Введите описание коллекции...',
        ],
        'hints' => [
            'handle' => 'Оставьте пустым для автоматической генерации из названия',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'cancel' => 'Отмена',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
        ],
    ],

    'collections_create' => [
        'title' => 'Создание коллекции',
        'description' => 'Добавление новой коллекции',
        'actions' => [
            'create' => 'Создать коллекцию',
            'creating' => 'Создание...',
        ],
    ],

    'categories' => [
        'title' => 'Категории',
        'description' => 'Управление категориями товаров',
        'actions' => [
            'create' => 'Создать категорию',
        ],
    ],

    'categories_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Название',
            'title' => 'Заголовок',
            'products' => 'Товары',
            'created' => 'Создана',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по названию...',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Категории не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'categories' => 'категорий?',
        ],
        'success' => [
            'deleted' => 'Категория успешно удалена',
            'bulk_deleted' => 'Категории успешно удалены',
        ],
        'errors' => [
            'delete_failed' => 'Не удалось удалить категорию',
            'bulk_delete_failed' => 'Не удалось удалить категории',
        ],
    ],

    'categories_edit' => [
        'title' => 'Редактирование категории',
        'description' => 'Изменение информации о категории',
        'fields' => [
            'name' => 'Название',
            'handle' => 'Идентификатор',
            'title' => 'Заголовок',
            'header' => 'Шапка',
            'description' => 'Описание',
        ],
        'placeholders' => [
            'name' => 'Введите название категории',
            'handle' => 'например, letnie-platya',
            'title' => 'Введите заголовок категории',
            'header' => 'Введите шапку категории',
            'description' => 'Введите описание категории...',
        ],
        'hints' => [
            'handle' => 'Оставьте пустым для автоматической генерации из названия',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'cancel' => 'Отмена',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
        ],
    ],

    'categories_create' => [
        'title' => 'Создание категории',
        'description' => 'Добавление новой категории',
        'actions' => [
            'create' => 'Создать категорию',
            'creating' => 'Создание...',
        ],
    ],

    'options' => [
        'title' => 'Опции',
        'description' => 'Управление опциями товаров (Размер, Цвет и т.д.)',
        'actions' => [
            'create' => 'Создать опцию',
        ],
    ],

    'options_table' => [
        'columns' => [
            'id' => 'ID',
            'name' => 'Название',
            'values' => 'Значения',
            'created' => 'Создана',
        ],
        'actions' => [
            'edit' => 'Редактировать',
            'delete' => 'Удалить',
            'open_menu' => 'Открыть меню',
        ],
        'bulk' => [
            'selected' => 'выбрано',
            'delete_selected' => 'Удалить выбранные',
            'clear_selection' => 'Очистить выбор',
        ],
        'filters' => [
            'search_placeholder' => 'Поиск по названию...',
            'columns' => 'Колонки',
        ],
        'pagination' => [
            'rows_selected' => 'из',
            'row' => 'строк',
            'rows_per_page' => 'Строк на странице',
            'page' => 'Страница',
            'of' => 'из',
            'go_first' => 'На первую страницу',
            'go_previous' => 'На предыдущую страницу',
            'go_next' => 'На следующую страницу',
            'go_last' => 'На последнюю страницу',
        ],
        'empty' => 'Опции не найдены.',
        'confirm' => [
            'delete_one' => 'Вы уверены, что хотите удалить',
            'delete_many' => 'Вы уверены, что хотите удалить',
            'options' => 'опций?',
        ],
        'success' => [
            'deleted' => 'Опция успешно удалена',
            'bulk_deleted' => 'Опции успешно удалены',
        ],
        'errors' => [
            'delete_failed' => 'Не удалось удалить опцию',
            'bulk_delete_failed' => 'Не удалось удалить опции',
        ],
    ],

    'options_edit' => [
        'title' => 'Редактирование опции',
        'description' => 'Изменение информации об опции',
        'fields' => [
            'name' => 'Название',
            'title' => 'Заголовок',
            'description' => 'Описание',
        ],
        'placeholders' => [
            'name' => 'например, Размер, Цвет',
            'title' => 'Введите заголовок опции',
            'description' => 'Введите описание опции...',
        ],
        'values' => [
            'title' => 'Значения опции',
            'description' => 'Добавьте значения для этой опции (например, S, M, L для Размера)',
            'add' => 'Добавить значение',
            'add_first' => 'Добавить первое значение',
            'empty' => 'Значения ещё не добавлены',
            'placeholder' => 'Введите значение (например, Маленький, Красный, 42)',
        ],
        'required_fields' => 'Обязательные поля',
        'actions' => [
            'cancel' => 'Отмена',
            'save' => 'Сохранить изменения',
            'saving' => 'Сохранение...',
        ],
    ],

    'options_create' => [
        'title' => 'Создание опции',
        'description' => 'Добавление новой опции',
        'actions' => [
            'create' => 'Создать опцию',
            'creating' => 'Создание...',
        ],
    ],

    'impersonation' => [
        'impersonate' => 'Войти как',
        'stop' => 'Выйти из режима',
        'banner_text' => 'Вы вошли как',
    ],
];
