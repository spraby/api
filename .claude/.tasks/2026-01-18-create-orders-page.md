# Создание страницы Orders

Дата создания: 2026-01-18
Статус: **ВЫПОЛНЕНО**

## Описание
Создать страницу "Orders" для отображения заказов бренда залогиненного пользователя.
Страница должна быть реализована по аналогии со страницей Products.

## Чеклист

- [x] Раздел 1: Backend (Laravel)
  - [x] Создать OrderController в app/Http/Controllers/Admin/
  - [x] Реализовать метод index() для получения заказов бренда
  - [x] Добавить маршруты в routes/web.php

- [x] Раздел 2: Frontend (React/Inertia)
  - [x] Создать компонент Orders.tsx в Pages/
  - [x] Реализовать таблицу заказов с колонками: Order, Customer, Total, Status, Delivery, Payment, Created
  - [x] Добавить фильтрацию по имени/номеру заказа
  - [x] Добавить фильтрацию по статусу и оплате

- [x] Раздел 3: Навигация
  - [x] Добавить пункт меню "Orders" в app-sidebar.tsx

- [x] Раздел 4: Локализация
  - [x] Добавить переводы для Orders в en/admin.php
  - [x] Добавить переводы для Orders в ru/admin.php

- [x] Раздел 5: Проверка
  - [x] Запустить npm run lint и исправить ошибки

## Созданные файлы

1. `app/Http/Controllers/Admin/OrderController.php` - контроллер заказов
2. `resources/js/admin/Pages/Orders.tsx` - страница заказов

## Изменённые файлы

1. `routes/web.php` - добавлен маршрут `/sb/admin/orders`
2. `resources/js/admin/components/app-sidebar.tsx` - добавлен пункт меню Orders
3. `resources/lang/en/admin.php` - добавлены английские переводы
4. `resources/lang/ru/admin.php` - добавлены русские переводы