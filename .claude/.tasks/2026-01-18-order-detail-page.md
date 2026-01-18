# Создание страницы детального просмотра заказа

Дата создания: 2026-01-18
Статус: ВЫПОЛНЕНО

## Описание
Создание страницы просмотра детальной информации о заказе с timeline историей изменений. Использовать те же технологии и паттерны, что и на странице продукта (ProductEdit.tsx).

## Чеклист

- [x] Раздел 1: Backend (Laravel)
  - [x] 1.1 Добавить тип Audit в types/models.ts
  - [x] 1.2 Добавить метод show в OrderController.php
  - [x] 1.3 Добавить роут /orders/{order} в routes/web.php

- [x] Раздел 2: Переводы
  - [x] 2.1 Добавить переводы order_show в resources/lang/en/admin.php
  - [x] 2.2 Добавить переводы order_show в resources/lang/ru/admin.php

- [x] Раздел 3: Frontend (React)
  - [x] 3.1 Создать страницу OrderShow.tsx в Pages/
    - [x] 3.1.1 Header с кнопкой назад и названием заказа
    - [x] 3.1.2 Статусы заказа (status, delivery_status, financial_status)
    - [x] 3.1.3 Карточка информации о клиенте
    - [x] 3.1.4 Таблица товаров заказа (OrderItems)
    - [x] 3.1.5 Карточка информации о доставке (OrderShipping)
    - [x] 3.1.6 Timeline с историей изменений (Audits)
  - [x] 3.2 Обновить Orders.tsx - включить навигацию на страницу заказа

- [x] Раздел 4: Тестирование
  - [x] 4.1 Запустить npm run lint и исправить ошибки

## Созданные/измененные файлы

### Новые файлы:
- `resources/js/admin/Pages/OrderShow.tsx` - страница детального просмотра заказа

### Измененные файлы:
- `resources/js/admin/types/models.ts` - добавлен тип Audit
- `app/Http/Controllers/Admin/OrderController.php` - добавлен метод show()
- `routes/web.php` - добавлен роут /sb/admin/orders/{order}
- `resources/lang/en/admin.php` - добавлены переводы order_show
- `resources/lang/ru/admin.php` - добавлены переводы order_show
- `resources/js/admin/Pages/Orders.tsx` - включена навигация на страницу заказа

## Структура страницы OrderShow

```
+--------------------------------------------------+
| <- Back    Order #12345                   [View] |
| Created: Jan 18, 2026                            |
+--------------------------------------------------+
| [Pending] [Packing] [Paid]                       |
+--------------------------------------------------+
| LEFT COLUMN (2/3)        | RIGHT COLUMN (1/3)   |
|--------------------------|----------------------|
| ORDER ITEMS              | CUSTOMER INFO        |
| +----------------------+ | Name: John Doe       |
| | Product | Qty | Price| | Email: john@...      |
| +----------------------+ | Phone: +1234...      |
| | Item 1  | 2   | $20  | +----------------------+
| | Item 2  | 1   | $15  | |                      |
| +----------------------+ | TIMELINE             |
| Total: $55              | | [+] Created          |
|                         | |     by Admin         |
| SHIPPING INFO           | | [~] Updated          |
| Recipient: John Doe     | |     Status changed   |
| Phone: +1234567890      | +----------------------+
| Note: Leave at door     |                        |
|                         |                        |
| ORDER NOTE (if exists)  |                        |
| Some note text...       |                        |
+--------------------------------------------------+
```

## URL
`/sb/admin/orders/{order_id}`
