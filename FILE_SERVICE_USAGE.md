# FileService - Сервис для работы с файлами на S3

Централизованный сервис для загрузки, удаления и управления файлами на AWS S3.

## Установка

Сервис уже зарегистрирован в `AppServiceProvider` и готов к использованию через dependency injection.

## Быстрый старт

### 1. Простая загрузка изображения

```php
use App\Services\FileService;
use App\DTOs\FileUploadDTO;
use App\Enums\FileType;

class ImageController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    public function upload(Request $request)
    {
        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'brands/' . auth()->user()->getBrand()->id
        );

        $path = $this->fileService->upload($request->file('image'), $dto);

        return response()->json([
            'path' => $path,
            'url' => $this->fileService->getUrl($path),
        ]);
    }
}
```

### 2. Загрузка с кастомными настройками

```php
$dto = new FileUploadDTO(
    fileType: FileType::IMAGE,
    directory: 'brands/123',
    filename: 'avatar',                    // Кастомное имя (без расширения)
    visibility: 'public',                  // public или private
    generateUniqueName: false,              // Использовать кастомное имя
    maxSize: 5 * 1024 * 1024,              // 5MB максимум
    allowedMimes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['jpg', 'jpeg', 'png']
);

$path = $this->fileService->upload($file, $dto);
```

### 3. Загрузка нескольких файлов

```php
$dto = new FileUploadDTO(
    fileType: FileType::DOCUMENT,
    directory: 'contracts'
);

$files = $request->file('documents'); // массив файлов

$paths = $this->fileService->uploadMultiple($files, $dto);

foreach ($paths as $path) {
    Document::create(['path' => $path]);
}
```

### 4. Удаление файлов

```php
// Удаление одного файла
$this->fileService->delete('brands/123/images/avatar.jpg');

// Удаление нескольких файлов
$this->fileService->deleteMultiple([
    'brands/123/images/image1.jpg',
    'brands/123/images/image2.jpg',
]);
```

### 5. Получение URL

```php
// Публичный URL
$url = $this->fileService->getUrl('brands/123/images/logo.png');

// Временный URL (для приватных файлов)
$tempUrl = $this->fileService->getTemporaryUrl(
    'brands/123/documents/contract.pdf',
    expiration: 120 // 120 минут
);
```

### 6. Проверка существования и получение метаданных

```php
// Проверка существования
if ($this->fileService->exists('path/to/file.jpg')) {
    // файл существует
}

// Получение метаданных
$metadata = $this->fileService->getMetadata('path/to/file.jpg');
// Возвращает:
// [
//     'path' => 'path/to/file.jpg',
//     'size' => 1024000,
//     'last_modified' => 1704312000,
//     'mime_type' => 'image/jpeg',
//     'url' => 'https://...'
// ]
```

### 7. Перемещение файлов

```php
$this->fileService->move(
    from: 'temp/uploads/file.jpg',
    to: 'brands/123/images/file.jpg'
);
```

## FileType enum

Доступные типы файлов с предустановленными настройками:

| Тип | Директория | Макс. размер | Допустимые форматы |
|-----|------------|--------------|-------------------|
| `FileType::IMAGE` | `images/` | 10MB | jpg, jpeg, png, gif, webp, svg |
| `FileType::DOCUMENT` | `documents/` | 20MB | pdf, doc, docx, xls, xlsx, txt, csv |
| `FileType::VIDEO` | `videos/` | 100MB | mp4, mpeg, mov, avi, webm |
| `FileType::AUDIO` | `audio/` | 50MB | mp3, wav, ogg, m4a |
| `FileType::OTHER` | `files/` | 50MB | любые |

Каждый тип имеет методы:
- `getDirectory()` - получить директорию
- `getAllowedMimes()` - получить допустимые MIME типы
- `getAllowedExtensions()` - получить допустимые расширения
- `getMaxSize()` - получить максимальный размер

## FileUploadDTO параметры

```php
new FileUploadDTO(
    fileType: FileType,           // Тип файла (обязательно)
    directory: ?string,            // Кастомная директория
    filename: ?string,             // Кастомное имя файла (без расширения)
    visibility: string,            // 'public' или 'private' (по умолчанию 'private')
    generateUniqueName: bool,      // Генерировать UUID имя (по умолчанию true)
    maxSize: ?int,                 // Макс. размер в байтах (null = из FileType)
    allowedMimes: ?array,          // Допустимые MIME типы (null = из FileType)
    allowedExtensions: ?array,     // Допустимые расширения (null = из FileType)
    preserveOriginalName: bool,    // Сохранить оригинальное имя (по умолчанию false)
)
```

## Обработка ошибок

Сервис выбрасывает `FileUploadException` при ошибках:

```php
use App\Exceptions\FileUploadException;

try {
    $path = $this->fileService->upload($file, $dto);
} catch (FileUploadException $e) {
    // Обработка ошибки
    Log::error('File upload failed', [
        'error' => $e->getMessage(),
        'file' => $file->getClientOriginalName(),
    ]);

    return response()->json([
        'error' => $e->getMessage()
    ], 400);
}
```

Типы ошибок:
- `FileUploadException::invalidFileSize()` - файл слишком большой
- `FileUploadException::invalidMimeType()` - недопустимый MIME тип
- `FileUploadException::invalidExtension()` - недопустимое расширение
- `FileUploadException::uploadFailed()` - ошибка загрузки
- `FileUploadException::deleteFailed()` - ошибка удаления
- `FileUploadException::fileNotFound()` - файл не найден
- `FileUploadException::moveFailed()` - ошибка перемещения

## Примеры использования

### Пример 1: Загрузка аватара пользователя

```php
public function updateAvatar(Request $request)
{
    $user = auth()->user();

    // Удалить старый аватар если есть
    if ($user->avatar_path) {
        $this->fileService->delete($user->avatar_path);
    }

    // Загрузить новый
    $dto = new FileUploadDTO(
        fileType: FileType::IMAGE,
        directory: "users/{$user->id}",
        filename: 'avatar',
        visibility: 'public',
        generateUniqueName: false,
        maxSize: 2 * 1024 * 1024, // 2MB
    );

    $path = $this->fileService->upload($request->file('avatar'), $dto);

    $user->update(['avatar_path' => $path]);

    return response()->json([
        'avatar_url' => $this->fileService->getUrl($path)
    ]);
}
```

### Пример 2: Загрузка галереи продукта

```php
public function uploadGallery(Request $request, Product $product)
{
    $dto = new FileUploadDTO(
        fileType: FileType::IMAGE,
        directory: "products/{$product->id}/gallery"
    );

    $paths = $this->fileService->uploadMultiple(
        $request->file('images'),
        $dto
    );

    foreach ($paths as $path) {
        $product->images()->create(['path' => $path]);
    }

    return response()->json([
        'uploaded' => count($paths),
        'images' => $product->images->map(fn($img) => [
            'path' => $img->path,
            'url' => $this->fileService->getUrl($img->path)
        ])
    ]);
}
```

### Пример 3: Загрузка документа с сохранением оригинального имени

```php
public function uploadContract(Request $request)
{
    $dto = new FileUploadDTO(
        fileType: FileType::DOCUMENT,
        directory: 'contracts',
        preserveOriginalName: true,  // Сохранить оригинальное имя
        visibility: 'private'
    );

    $path = $this->fileService->upload($request->file('contract'), $dto);

    // Создать временный URL для скачивания (действителен 1 час)
    $downloadUrl = $this->fileService->getTemporaryUrl($path, 60);

    return response()->json([
        'path' => $path,
        'download_url' => $downloadUrl
    ]);
}
```

## Интеграция с существующим кодом

### Обновление модели Image

```php
use App\Services\FileService;

class Image extends Model
{
    protected static function booted(): void
    {
        static::deleting(function (Image $image) {
            if ($image->src) {
                // Используем сервис вместо прямого обращения к Storage
                app(FileService::class)->delete($image->src);
            }
        });
    }

    // Получение URL через сервис
    public function getUrlAttribute(): string
    {
        return app(FileService::class)->getUrl($this->src);
    }
}
```

## Тестирование

Все методы сервиса покрыты тестами. Пример тестирования:

```php
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\FileService;
use App\DTOs\FileUploadDTO;
use App\Enums\FileType;

class MyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');
    }

    public function test_can_upload_file()
    {
        $fileService = app(FileService::class);
        $file = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $fileService->upload($file, $dto);

        $this->assertTrue($fileService->exists($path));
    }
}
```

## Структура директорий на S3

Рекомендуемая структура:

```
s3://your-bucket/
├── brands/
│   ├── admin/
│   │   ├── images/
│   │   ├── documents/
│   │   └── videos/
│   └── {brand_id}/
│       ├── images/
│       ├── documents/
│       └── videos/
├── users/
│   └── {user_id}/
│       └── images/
├── products/
│   └── {product_id}/
│       ├── images/
│       └── gallery/
└── temp/
    └── uploads/
```

## Best Practices

1. **Всегда используйте DTO** - не создавайте параметры вручную
2. **Обрабатывайте исключения** - FileService выбрасывает типизированные исключения
3. **Используйте типы файлов** - FileType enum предоставляет безопасные дефолты
4. **Удаляйте старые файлы** - при обновлении файлов удаляйте старые версии
5. **Генерируйте уникальные имена** - по умолчанию используется UUID
6. **Используйте временные URL** - для приватных файлов генерируйте временные ссылки
7. **Тестируйте с Storage::fake()** - не загружайте файлы на реальный S3 в тестах

## Дополнительная информация

- Сервис использует Laravel Storage facade
- Все операции логируются при ошибках
- Валидация выполняется до загрузки файла
- Поддерживаются все настройки S3 из config/filesystems.php