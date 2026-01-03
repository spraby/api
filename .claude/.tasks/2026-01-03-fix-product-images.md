# Исправление отображения картинок продуктов

Дата создания: 2026-01-03

## Описание
На странице products картинка для продукта выводится некорректно. Проблема в ProductController - используется неверное поле `path` вместо `src`, а также не используется встроенный accessor `url` из модели Image.

## Анализ проблемы

### Текущая реализация (ProductController.php)
```php
'image_url' => $mainImage && $mainImage->image
    ? config('filesystems.disks.s3.url').'/'.$mainImage->image->path  // ❌ ОШИБКА
    : null,
```

**Проблемы:**
1. Используется `$mainImage->image->path`, но в модели Image поле называется `src`
2. Ручное конструирование URL через `config('filesystems.disks.s3.url')` вместо использования встроенного метода
3. Модель Image имеет accessor `getUrlAttribute()`, который правильно формирует URL через `Storage::disk('s3')->url($this->src)`

### Правильная реализация
```php
'image_url' => $mainImage?->image?->url
```

## Чеклист

- [x] **Раздел 1: Анализ кода**
  - [x] Прочитать ProductController.php
  - [x] Прочитать модель Image
  - [x] Прочитать модель Product
  - [x] Прочитать модель ProductImage
  - [x] Определить источник проблемы

- [x] **Раздел 2: Исправление кода**
  - [x] Исправить метод `apiIndex()` в ProductController
  - [x] Исправить метод `apiShow()` в ProductController
  - [x] Исправить метод `apiUpdate()` в ProductController

- [x] **Раздел 3: Проверка**
  - [x] Запустить линтер: `npm run lint`
  - [x] Исправить ошибки линтера (если есть)
  - [ ] Протестировать страницу products в браузере

## Файлы для изменения

1. `app/Http/Controllers/Admin/ProductController.php`
   - Метод `apiIndex()` - строка 90-92
   - Метод `apiShow()` - строка 125-127
   - Метод `apiUpdate()` - строка 229-231

## Ожидаемый результат

После исправления картинки продуктов будут корректно отображаться на странице `/sb/admin/products`, используя правильный URL из S3 через accessor модели Image.