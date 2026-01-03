# Задача: Создать страницу Media в админке для управления изображениями

Дата создания: 2026-01-03

## Описание

Создать страницу медиа-библиотеки в React/Inertia админке (`/sb/admin/media`) для отображения и загрузки изображений из таблицы `images`. Страница должна показывать все загруженные картинки с возможностью загрузки новых (до 50 штук за раз) и удаления существующих. Загрузка должна использовать FileService из предыдущей задачи.

## Требования

- Отображать таблицу с изображениями из БД (`images`)
- Кнопка для загрузки нескольких файлов (до 50 штук)
- Использовать FileService на бэкенде для работы с S3
- Превью изображений в таблице
- Возможность удаления изображений
- Уведомления об успешной загрузке/ошибках

## Чеклист

- [x] **Раздел 1: Подготовка и анализ**
  - [x] Изучить структуру таблицы `images` и модель `Image`
  - [x] Изучить существующие relationship (Brand, ProductImage)
  - [x] Определить необходимые поля для отображения (id, name, src, brand_id, created_at)
  - [x] Проверить Observer для автоматического удаления из S3

- [x] **Раздел 2: Backend - Контроллер**
  - [x] Создать контроллер `MediaController` в `app/Http/Controllers/Admin/`
  - [x] Метод `index()` - получение списка изображений с пагинацией
  - [x] Метод `store()` - загрузка нескольких изображений через FileService
  - [x] Метод `destroy()` - удаление изображения (автоматически удалит из S3 через Observer)
  - [x] Добавить валидацию запросов (FormRequest или inline validation)

- [x] **Раздел 3: Backend - Маршруты**
  - [x] Добавить маршруты в `routes/web.php` в группу `sb/admin`
  - [x] GET `/sb/admin/media` - index
  - [x] POST `/sb/admin/media` - store
  - [x] DELETE `/sb/admin/media/{id}` - destroy

- [x] **Раздел 4: Frontend - Компонент страницы**
  - [x] Создать `resources/js/admin/Pages/Media.tsx`
  - [x] Использовать `AdminLayout` для обёртки
  - [x] Создать заголовок страницы с кнопкой "Upload Images"
  - [x] Типизировать props (PageProps + images)

- [x] **Раздел 5: Frontend - Таблица изображений**
  - [x] Реализовать grid с изображениями:
    - [x] Preview (thumbnail) - отображать img с src URL
    - [x] Name
    - [x] Brand
    - [x] Actions (Delete button)
  - [x] Использовать Card компонент для каждого изображения
  - [x] Добавить пагинацию

- [x] **Раздел 6: Frontend - Форма загрузки**
  - [x] Создать Dialog/Modal для загрузки файлов
  - [x] Использовать `<input type="file" multiple accept="image/*" />`
  - [x] Добавить валидацию: максимум 50 файлов
  - [x] Показывать список выбранных файлов перед загрузкой
  - [x] Использовать Inertia router.post() для отправки файлов
  - [x] Добавить loading state во время загрузки

- [x] **Раздел 7: Frontend - Обработка ошибок и уведомления**
  - [x] Использовать `sonner` (toast) для уведомлений
  - [x] Успешная загрузка - показать toast с количеством загруженных файлов
  - [x] Ошибки валидации - показать toast с описанием ошибки
  - [x] Обработать ошибки FileService (размер, формат)

- [x] **Раздел 8: Frontend - Удаление изображений**
  - [x] Добавить кнопку Delete в каждую карточку изображения
  - [x] Показывать AlertDialog для подтверждения удаления
  - [x] Использовать Inertia router.delete() для удаления
  - [x] Показать toast об успешном удалении

- [x] **Раздел 9: Навигация**
  - [x] Добавить пункт "Media" в sidebar (`app-sidebar.tsx`)
  - [x] Использовать иконку из lucide-react (ImageIcon)
  - [x] Добавить в соответствующую группу навигации

- [x] **Раздел 10: Локализация**
  - [x] Добавить переводы в `resources/lang/en/admin.php`
  - [x] Добавить переводы в `resources/lang/ru/admin.php`
  - [x] Добавить common секцию для общих кнопок
  - [x] Добавить pagination секцию

- [x] **Раздел 11: Тестирование**
  - [x] Готово к ручному тестированию после запуска приложения

- [x] **Раздел 12: Проверка кода**
  - [x] Запустить `npm run lint` для проверки frontend кода ✅
  - [x] Исправить ошибки через `npm run lint:fix` ✅ (все ошибки исправлены)
  - [x] Запустить `./vendor/bin/pint` для проверки backend кода ✅ (117 style issues исправлено)

## Технические детали

### Модель Image

Поля из БД:
- `id` (bigint)
- `name` (varchar)
- `src` (varchar) - путь к файлу на S3
- `brand_id` (bigint)
- `created_at`, `updated_at`

Relationships:
- `belongsTo(Brand::class)`
- `belongsToMany(Product::class)` через `product_images`

Observer:
- `ImageObserver` - автоматически удаляет файл из S3 при deleting

### Backend API

**MediaController:**
```php
class MediaController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    public function index()
    {
        $images = Image::query()
            ->when(!auth()->user()->hasRole('admin'), function ($query) {
                $query->where('brand_id', auth()->user()->getBrand()->id);
            })
            ->with('brand')
            ->latest()
            ->paginate(50);

        return Inertia::render('Media', [
            'images' => $images,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'images' => 'required|array|max:50',
            'images.*' => 'required|image|max:10240', // 10MB
        ]);

        $brand = auth()->user()->getBrand();
        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: "brands/{$brand->id}/images",
            visibility: 'public'
        );

        $paths = $this->fileService->uploadMultiple($validated['images'], $dto);

        foreach ($paths as $path) {
            Image::create([
                'name' => basename($path),
                'src' => $path,
                'brand_id' => $brand->id,
            ]);
        }

        return redirect()->back()->with('success', count($paths) . ' images uploaded');
    }

    public function destroy(Image $image)
    {
        $this->authorize('delete', $image); // Опционально: Policy

        $image->delete(); // Observer автоматически удалит из S3

        return redirect()->back()->with('success', 'Image deleted');
    }
}
```

### Frontend Component

**Pages/Media.tsx:**
```tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PageProps } from '@/types/inertia';
import { Image } from '@/types/models';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLang } from '@/lib/lang';

interface MediaProps extends PageProps {
    images: {
        data: Image[];
        // pagination fields
    };
}

export default function Media({ images }: MediaProps) {
    const { t } = useLang();
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const handleUpload = () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        const formData = new FormData();
        Array.from(selectedFiles).forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        router.post(route('sb.admin.media.store'), formData, {
            onSuccess: () => {
                toast.success(t('admin.media.success_upload'));
                setUploadOpen(false);
                setSelectedFiles(null);
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', '));
            },
        });
    };

    return (
        <AdminLayout>
            {/* Header + Upload Button */}
            {/* Table with images */}
            {/* Upload Dialog */}
        </AdminLayout>
    );
}
```

## Примечания

- Использовать shadcn/ui компоненты (Dialog, Button, AlertDialog, Table)
- FileService автоматически валидирует файлы (размер, MIME, расширение)
- ImageObserver уже настроен для удаления файлов из S3
- Row Level Security: менеджеры видят только изображения своего бренда
- Brand ID автоматически присваивается из текущего пользователя
- Tailwind 4 для стилизации
- Dark mode support обязателен