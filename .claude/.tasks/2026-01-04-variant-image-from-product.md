# Выбор изображения варианта из изображений продукта

Дата создания: 2026-01-04
Дата завершения: 2026-01-04

## Статус: ✅ ЗАВЕРШЕНО

## Описание

Изменить логику выбора изображения для варианта продукта. Вместо выбора из всей медиатеки, варианты должны выбирать изображения только из тех, которые уже привязаны к текущему продукту.

## Требования

- ✅ Создать компонент ProductImagesPicker для выбора из изображений продукта
- ✅ Заменить MediaPickerDialog на ProductImagesPicker для вариантов
- ✅ Показывать только изображения текущего продукта
- ✅ Поддержка single selection (только одно изображение)
- ✅ Визуальное отображение выбранного изображения
- ✅ Локализация (en/ru)

## Текущая реализация

Сейчас используется `MediaPickerDialog`, который:
- Показывает ВСЕ изображения из медиатеки
- Требует проверку что изображение привязано к продукту
- Усложняет пользовательский опыт

## Новая реализация

Создать `ProductImagesPicker`, который:
- Показывает ТОЛЬКО изображения текущего продукта
- Простой и понятный интерфейс
- Не требует дополнительных проверок

## Чеклист

- [x] Создать компонент ProductImagesPicker
- [x] Обновить ProductEdit для использования нового компонента
- [x] Добавить локализацию
- [x] Запустить линтинг (0 ошибок)

## Реализация

### Созданные файлы

**`resources/js/admin/components/product-images-picker.tsx`** - новый компонент

**Интерфейс:**
```typescript
interface ProductImagesPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (productImageId: number) => void;
  productImages: ProductImage[];
  currentImageId?: number | null;
}
```

**Возможности:**
- ✅ Показывает только изображения текущего продукта
- ✅ Single selection (одно изображение)
- ✅ Визуальное отображение выбранного изображения
- ✅ Сортировка по позиции
- ✅ Показ позиции и пометка "Main" для первого изображения
- ✅ Состояние пустого списка с подсказкой
- ✅ Полная локализация (en/ru)

### Изменённые файлы

**`resources/js/admin/Pages/ProductEdit.tsx`**

1. **Заменён импорт:**
   - Было: `MediaPickerDialog`
   - Стало: `ProductImagesPicker`

2. **Упрощена логика `handleVariantImageSelect`:**
   ```typescript
   // Было:
   const handleVariantImageSelect = (imageIds: number[]) => {
     // Поиск ProductImage по image_id
     const selectedImageId = imageIds[0];
     const productImage = product?.images?.find((pi) => pi.image_id === selectedImageId);

     if (!productImage) {
       toast.error(t('admin.products_edit.errors.image_not_attached'));
       return;
     }

     setVariantImage.mutate({
       data: { product_image_id: productImage.id },
     });
   };

   // Стало:
   const handleVariantImageSelect = (productImageId: number) => {
     setVariantImage.mutate({
       data: { product_image_id: productImageId },
     });
   };
   ```

3. **Заменён компонент:**
   ```tsx
   // Было:
   <MediaPickerDialog
     excludeImageIds={[]}
     multiple={false}
     open={variantImagePicker.open}
     onOpenChange={(open) => {
       setVariantImagePicker({ open, variantIndex: null });
     }}
     onSelect={handleVariantImageSelect}
   />

   // Стало:
   <ProductImagesPicker
     currentImageId={
       variantImagePicker.variantIndex !== null
         ? variants[variantImagePicker.variantIndex]?.image_id
         : null
     }
     open={variantImagePicker.open}
     productImages={product.images || []}
     onOpenChange={(open) => {
       setVariantImagePicker({ open, variantIndex: null });
     }}
     onSelect={handleVariantImageSelect}
   />
   ```

**Локализация:**

**EN** (`resources/lang/en/admin.php`):
```php
'product_images_picker' => [
    'title' => 'Select Product Image',
    'description' => 'Choose an image from the product\'s images',
    'no_images' => 'No images for this product',
    'add_images_first' => 'Add images to the product first',
    'position' => 'Position',
    'main' => 'Main',
    'select_button' => 'Select Image',
],
```

**RU** (`resources/lang/ru/admin.php`):
```php
'product_images_picker' => [
    'title' => 'Выбор изображения товара',
    'description' => 'Выберите изображение из изображений товара',
    'no_images' => 'Нет изображений для этого товара',
    'add_images_first' => 'Сначала добавьте изображения к товару',
    'position' => 'Позиция',
    'main' => 'Главное',
    'select_button' => 'Выбрать изображение',
],
```

## Преимущества нового подхода

### До (MediaPickerDialog):
❌ Показывает ВСЕ изображения из медиатеки
❌ Требует проверку что изображение привязано к продукту
❌ Усложняет пользовательский опыт
❌ Возможность выбрать изображение не из продукта (с ошибкой)

### После (ProductImagesPicker):
✅ Показывает ТОЛЬКО изображения продукта
✅ Не требует дополнительных проверок
✅ Простой и понятный интерфейс
✅ Невозможно выбрать неправильное изображение
✅ Показывает позицию и отмечает главное изображение

## Технические детали

- Компонент получает `product.images` напрямую из пропсов
- Сортировка по `position` для правильного порядка
- `currentImageId` используется для выделения текущего выбора
- Single selection mode (только одно изображение)
- Автоматическое закрытие диалога после выбора
- Состояние пустого списка с призывом к действию

✅ **Линтинг прошёл успешно** (0 ошибок)