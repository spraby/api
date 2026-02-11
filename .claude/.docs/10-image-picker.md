# Image Picker

## Обзор

Image Picker - модальный диалог для выбора изображений из медиа-библиотеки и/или загрузки новых файлов. Используется в админ-панели (React/Inertia) для работы с изображениями продуктов и медиа-библиотекой.

## Структура файлов

```
resources/js/admin/components/
├── image-picker/
│   ├── index.ts                  # Re-export ImagePicker
│   ├── image-picker.tsx          # Главный компонент (Dialog + Tabs)
│   ├── library-content.tsx       # Таб "Библиотека" (поиск + сетка + пагинация)
│   └── upload-content.tsx        # Таб "Загрузка" (drag & drop + превью)
├── product-images-manager.tsx    # Менеджер изображений продукта (использует ImagePicker)
└── product-images-picker.tsx     # Пикер для выбора изображения варианта из уже привязанных к продукту
```

## Компоненты

### `ImagePicker` (image-picker.tsx)

Главный компонент. Отображает модальный `Dialog` с двумя табами: "Библиотека" и "Загрузка".

**Props:**

| Prop | Тип | Default | Описание |
|------|-----|---------|----------|
| `open` | `boolean` | - | Управляет видимостью диалога |
| `onOpenChange` | `(open: boolean) => void` | - | Callback при открытии/закрытии |
| `onSelect` | `(imageIds: number[]) => void` | - | Callback при выборе изображений из библиотеки |
| `onUpload` | `(files: File[]) => void` | - | Callback при загрузке файлов |
| `multiple` | `boolean` | `true` | Множественный выбор |
| `excludeImageIds` | `number[]` | `[]` | ID изображений для исключения из библиотеки |
| `isUploading` | `boolean` | `false` | Флаг процесса загрузки (блокирует кнопки) |
| `maxFiles` | `number` | `50` | Макс. количество файлов для загрузки |
| `defaultTab` | `'select' \| 'upload'` | `'select'` | Таб по умолчанию |
| `hideUpload` | `boolean` | `false` | Скрыть таб загрузки |
| `hideLibrary` | `boolean` | `false` | Скрыть таб библиотеки |

**Внутреннее состояние:**
- `activeTab` - текущий таб (`'select'` или `'upload'`)
- `selectedImageIds` - массив выбранных ID изображений (для библиотеки)
- `searchQuery` - строка поиска
- `currentPage` - текущая страница пагинации
- `selectedFiles` - массив `File` объектов (для загрузки)
- `dragActive` - активен ли drag & drop

**Логика:**
- При закрытии диалога все состояние сбрасывается (useEffect на `open`)
- Если `hideLibrary=true`, автоматически активируется таб `upload`
- Если `hideUpload=true`, автоматически активируется таб `select`
- Если оба таба видны, показываются `Tabs` (shadcn/ui); если один скрыт, контент рендерится без табов

### `LibraryContent` (library-content.tsx)

Контент таба "Библиотека". Отображает сетку изображений из медиа-библиотеки с поиском и пагинацией.

**Состоит из:**
1. **Поиск** - `Input` с иконкой поиска. При вводе сбрасывает страницу на 1
2. **Сетка изображений** - `grid grid-cols-2 sm:3 md:4` из `Card` компонентов
   - Каждое изображение - кликабельная карточка
   - Выбранные изображения подсвечиваются `ring-2 ring-primary` и оверлеем с `CheckIcon`
   - При загрузке показывает 12 `Skeleton` плейсхолдеров
   - При отсутствии изображений показывает empty state
3. **Пагинация** - кнопки "назад/вперед" с отображением текущей страницы и общего количества

**Данные загружаются через хук `useMedia`** (см. ниже).

### `UploadContent` (upload-content.tsx)

Контент таба "Загрузка". Зона drag & drop и список выбранных файлов.

**Состоит из:**
1. **Drop zone** - область для перетаскивания файлов или клика (открывает file picker)
   - Стилизуется при `dragActive` (подсветка border/background)
   - Показывает количество выбранных файлов
   - Доступен с клавиатуры (Enter/Space)
2. **Скрытый `<input type="file">`** - `accept="image/*"`, `multiple`
3. **Список файлов** - прокручиваемый список с:
   - Превью изображения (через `URL.createObjectURL`, с `useMemo` + cleanup через `revokeObjectURL`)
   - Имя файла и размер в MB
   - Кнопка удаления (XIcon)

### `ProductImagesPicker` (product-images-picker.tsx)

Отдельный компонент (НЕ часть ImagePicker). Диалог для выбора изображения варианта из уже привязанных к продукту изображений.

**Props:**

| Prop | Тип | Описание |
|------|-----|----------|
| `open` | `boolean` | Видимость диалога |
| `onOpenChange` | `(open: boolean) => void` | Callback при открытии/закрытии |
| `onSelect` | `(productImageId: number) => void` | Callback при выборе |
| `productImages` | `ProductImage[]` | Массив изображений продукта |
| `currentImageId` | `number \| null` | Текущее выбранное изображение |

Используется в `ProductVariantList` для назначения изображения конкретному варианту.

## Хук `useMedia`

**Файл:** `resources/js/admin/lib/hooks/api/useMedia.ts`

React Query хук для получения изображений из медиа-библиотеки.

```typescript
useMedia(filters?: MediaFilters, options?: UseQueryOptions)
```

**Параметры фильтрации (`MediaFilters`):**
- `search?: string` - поиск по имени
- `page?: number` - номер страницы
- `per_page?: number` - элементов на странице

**Возвращает `PaginatedResponse<Image>`:**
```typescript
{
  data: Image[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}
```

**API endpoint:** `GET /admin/media/api?search=...&page=...&per_page=...`

Запрос выполняется только когда `enabled: true` (диалог открыт и библиотека не скрыта).

## Backend API

**Контроллер:** `App\Http\Controllers\Admin\MediaController`

### Маршруты (`/admin/media/...`)

| Метод | URL | Action | Описание |
|-------|-----|--------|----------|
| GET | `/admin/media` | `index` | Страница медиа-галереи (Inertia) |
| GET | `/admin/media/api` | `apiIndex` | JSON API для ImagePicker (пагинация, поиск) |
| POST | `/admin/media` | `store` | Загрузка изображений (до 50 файлов, max 10MB каждый) |
| DELETE | `/admin/media/{image}` | `destroy` | Удаление изображения |

### `apiIndex` (JSON endpoint для библиотеки)

- Загружает изображения с `brands:id,name`
- **Row Level Security**: менеджеры видят только изображения своего бренда
- Поиск по полю `name` через `LIKE %query%`
- Пагинация (по умолчанию 24 на страницу)
- Возвращает JSON с `data` и `meta`

### `store` (загрузка)

- Валидация: `images` - массив, max 50 штук, каждый файл - image, max 10MB
- Загрузка через `FileService` в S3: `brands/{brand_id}/`
- Создание `Image` модели с `name` (оригинальное имя файла) и `src` (S3 path)
- Привязка к бренду происходит автоматически через `Image::created()` event

### `destroy` (удаление)

- Авторизация: админы удаляют любые, менеджеры - только своего бренда
- `ProductImageObserver` автоматически удаляет файл из S3

## Типы

**`Image` (types/api.ts)** - используется в ImagePicker:
```typescript
interface Image {
  id: number;
  name: string;
  src: string;
  url: string;
  alt: string | null;
}
```

**`Image` (types/models.ts)** - модель Eloquent:
```typescript
interface Image extends BaseModel {
  name: string;
  src: string;
  alt?: string | null;
  meta?: string | null;
  url?: string;        // Computed accessor
  brands?: Brand[];
}
```

**`ProductImage` (types/models.ts)** - pivot-таблица product_images:
```typescript
interface ProductImage extends BaseModel {
  product_id: number;
  image_id: number;
  position: number;
  image?: Image;
}
```

## Зависимости (UI)

- `@radix-ui/react-dialog` (через shadcn `Dialog`)
- `@radix-ui/react-tabs` (через shadcn `Tabs`)
- `shadcn/ui`: `Button`, `Card`, `Input`, `Skeleton`, `Dialog`, `Tabs`
- `lucide-react`: `ImageIcon`, `UploadIcon`, `SearchIcon`, `CheckIcon`, `XIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- `@tanstack/react-query` (через `useMedia` хук)
- `@/lib/lang` (`useLang` для i18n)
- `@/lib/utils` (`cn` для условных классов)

## Flow: Использование в приложении

### 1. Страница Media (`Pages/Media.tsx`)

Используется **только для загрузки** (без библиотеки):

```tsx
<ImagePicker
  hideLibrary          // Скрыт таб библиотеки
  isUploading={isUploading}
  open={imagePickerOpen}
  onOpenChange={setImagePickerOpen}
  onUpload={handleUpload}   // POST /admin/media через Inertia router
/>
```

**Flow:**
1. Пользователь нажимает "Upload" на странице Media
2. Открывается ImagePicker с табом загрузки (библиотека скрыта)
3. Пользователь выбирает файлы (drag & drop или file picker)
4. Нажимает "Upload" -> `handleUpload` отправляет `FormData` через `router.post` на `admin.media.store`
5. Сервер загружает файлы в S3, создает записи `Image`
6. При успехе диалог закрывается, страница обновляется (Inertia)

### 2. Менеджер изображений продукта (`ProductImagesManager`)

Используется **с обоими табами** (библиотека + загрузка):

```tsx
<ImagePicker
  excludeImageIds={excludedImageIds}   // Уже привязанные к продукту
  isUploading={isProcessing}
  multiple
  open={imagePickerOpen}
  onOpenChange={setImagePickerOpen}
  onSelect={handleMediaSelect}   // POST attach image IDs
  onUpload={handleUpload}        // POST upload new files
/>
```

**Flow выбора из библиотеки:**
1. На странице редактирования продукта пользователь нажимает кнопку добавления изображений
2. Открывается ImagePicker, таб "Библиотека"
3. `useMedia` загружает изображения через `GET /admin/media/api`
4. Уже привязанные к продукту изображения исключены через `excludeImageIds`
5. Пользователь кликает на изображения для выбора (множественный)
6. Нажимает "Select (N)" -> `handleMediaSelect` отправляет `POST /admin/products/{id}/images/attach` с `image_ids`
7. Диалог закрывается, страница обновляется

**Flow загрузки:**
1. Пользователь переключается на таб "Загрузка"
2. Выбирает файлы через drag & drop или file picker
3. Нажимает "Upload" -> `handleUpload` отправляет `POST /admin/products/{id}/images/upload` с файлами
4. Сервер загружает в S3, создает `Image`, привязывает к продукту
5. Диалог закрывается, страница обновляется

### 3. Выбор изображения для варианта (`ProductVariantList`)

Использует **отдельный** компонент `ProductImagesPicker` (не `ImagePicker`):

```tsx
<ProductImagesPicker
  currentImageId={variantImagePicker?.variant?.image_id ?? null}
  open={variantImagePicker.open}
  onOpenChange={(open) => setVariantImagePicker({open, variant: null})}
  onSelect={handleVariantImageSelect}
  productImages={product.images ?? []}
/>
```

**Flow:**
1. У варианта есть кнопка выбора изображения
2. Открывается `ProductImagesPicker` с сеткой изображений, уже привязанных к продукту
3. Пользователь выбирает одно изображение
4. Для сохраненных вариантов: `PUT /admin/variants/{id}/image` с `product_image_id`
5. Для несохраненных вариантов: обновление `image_id` в локальном состоянии формы

## Диаграмма потока данных

```
┌──────────────────────────────────────────────────────────────────┐
│                        ImagePicker Dialog                        │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │    Tab: Library         │  │    Tab: Upload              │   │
│  │                         │  │                             │   │
│  │  useMedia() ──────────► │  │  File input / Drag & Drop  │   │
│  │  GET /admin/media/api   │  │         ▼                   │   │
│  │         ▼               │  │  selectedFiles: File[]      │   │
│  │  Image grid + search    │  │         ▼                   │   │
│  │         ▼               │  │  Preview list               │   │
│  │  selectedImageIds[]     │  │                             │   │
│  │         ▼               │  │         ▼                   │   │
│  │  onSelect(ids)          │  │  onUpload(files)            │   │
│  └────────────┬────────────┘  └──────────────┬──────────────┘   │
│               │                               │                  │
└───────────────┼───────────────────────────────┼──────────────────┘
                │                               │
                ▼                               ▼
     ┌─────────────────────┐       ┌──────────────────────┐
     │  Parent component   │       │   Parent component    │
     │  handles attach     │       │   handles upload      │
     │  (router.post)      │       │   (router.post)       │
     └─────────────────────┘       └──────────────────────┘
```