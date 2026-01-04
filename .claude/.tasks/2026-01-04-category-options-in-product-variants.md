# Задача: Опции категории в вариантах продукта

Дата создания: 2026-01-04

## Описание

Реализовать функционал, где:
- Категории могут иметь привязанные опции (Options)
- Варианты продукта (Variants) содержат значения опций (OptionValues) через VariantValue
- Если продукту назначена категория, то варианты продукта должны использовать опции этой категории
- UI для редактирования на странице ProductEdit.tsx

## Текущее состояние

### Существующие модели и связи:
- ✅ `category_option` таблица (many-to-many) - существует
- ✅ `Category::options()` - BelongsToMany связь
- ✅ `Option::values()` - HasMany OptionValue
- ✅ `Variant::values()` - HasMany VariantValue
- ✅ `VariantValue` с полями: variant_id, option_id, option_value_id
- ✅ Страница ProductEdit.tsx с выбором категории

## Чеклист

- [ ] **Раздел 1: Backend - TypeScript типы**
  - [ ] Обновить `Category` interface - добавить `options?: Option[]`
  - [ ] Обновить `Variant` interface - добавить `values?: VariantValue[]`
  - [ ] Создать `VariantValue` interface с полями variant_id, option_id, option_value_id, relationships

- [ ] **Раздел 2: Backend - API контроллеры**
  - [ ] Обновить `CategoryController::index()` - eager load options.values
  - [ ] Обновить `ProductController::apiShow()` - eager load category.options.values и variants.values.value
  - [ ] Обновить `ProductController::apiUpdate()` - сохранять variant values при создании/обновлении вариантов
  - [ ] Добавить валидацию для variants.*.values в apiUpdate

- [ ] **Раздел 3: Frontend - Хуки и API**
  - [ ] Проверить/обновить `useCategories` hook - убедиться что получает options
  - [ ] Проверить/обновить `useProduct` hook - убедиться что получает category.options и variant.values

- [ ] **Раздел 4: Frontend - UI компоненты**
  - [ ] Создать компонент для отображения опций категории
  - [ ] Создать компонент для редактирования значений опций в варианте
  - [ ] Интегрировать в ProductEdit.tsx:
    - Показывать опции категории при выборе категории
    - Для каждого варианта - селекты/радио для выбора значений опций
    - Обновлять variant.values при изменении

- [ ] **Раздел 5: Frontend - Генерация вариантов (опционально, но рекомендуется)**
  - [ ] Кнопка "Сгенерировать варианты из опций"
  - [ ] Алгоритм генерации всех комбинаций option values
  - [ ] UI подтверждения перед генерацией (замена существующих вариантов)

- [ ] **Раздел 6: Локализация**
  - [ ] Добавить ключи переводов в `resources/lang/en/admin.php`
  - [ ] Добавить ключи переводов в `resources/lang/ru/admin.php`

- [ ] **Раздел 7: Тестирование и линтинг**
  - [ ] Протестировать создание продукта с категорией и вариантами
  - [ ] Протестировать изменение категории - обновление опций
  - [ ] Протестировать сохранение вариантов с values
  - [ ] Запустить `npm run lint` и исправить ошибки
  - [ ] Проверить работу в браузере

## Технические детали

### Структура VariantValue:
```typescript
interface VariantValue {
  id: number;
  variant_id: number;
  option_id: number;
  option_value_id: number;
  created_at: string;
  updated_at: string;
  option?: Option;
  value?: OptionValue; // Фактическое значение опции
}
```

### Пример JSON для сохранения:
```json
{
  "variants": [
    {
      "id": 1,
      "title": "Small Red",
      "price": "100.00",
      "final_price": "90.00",
      "enabled": true,
      "values": [
        { "option_id": 1, "option_value_id": 5 },  // Size: Small
        { "option_id": 2, "option_value_id": 10 }  // Color: Red
      ]
    }
  ]
}
```

## Заметки

- Использовать shadcn/ui компоненты (Select, Label, Card)
- Tailwind 4 синтаксис
- TypeScript строгая типизация
- Eager loading для оптимизации запросов
- Сохранять variant values в транзакции при обновлении продукта