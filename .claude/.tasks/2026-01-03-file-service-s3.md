# Задача: Разработать сервис для работы с файлами на S3

Дата создания: 2026-01-03

## Описание
Разработать централизованный сервис для работы с файлами на бэкенде (Laravel) для загрузки на AWS S3. Сервис должен инкапсулировать логику работы с файлами, обеспечивать валидацию, управление директориями и упростить работу с S3 во всем приложении.

## Текущее состояние

**Существующая работа с S3**:
- В модели `Image` (`app/Models/Image.php:88-92`) - удаление файлов при deleting:
  ```php
  static::deleting(function (Image $image) {
      if ($image->src) {
          Storage::disk('s3')->delete($image->src);
      }
  });
  ```
- В Filament форме (`app/Filament/Resources/Images/Schemas/ImageForm.php:37-47`) - загрузка через FileUpload:
  ```php
  FileUpload::make('src')
      ->disk('s3')
      ->image()
      ->directory(implode('/', $directoryPath))
      ->visibility('private')
  ```
- Получение URL в модели Image (`app/Models/Image.php:50-53`):
  ```php
  public function getUrlAttribute(): string {
      return Storage::disk('s3')->url($this->src);
  }
  ```

**Проблемы**:
- Логика работы с файлами разбросана по разным местам
- Нет централизованной валидации
- Нет единого API для работы с разными типами файлов
- Сложно масштабировать и тестировать

## Чеклист

- [x] **Раздел 1: Подготовка и анализ**
  - [x] Изучить существующую конфигурацию S3 в config/filesystems.php
  - [x] Изучить .env настройки AWS
  - [x] Определить структуру директорий на S3
  - [x] Определить требования к валидации файлов

- [x] **Раздел 2: Создание базовой структуры сервиса**
  - [x] Создать директорию `app/Services`
  - [x] Создать интерфейс `app/Services/Contracts/FileServiceInterface.php`
  - [x] Создать базовый класс `app/Services/FileService.php`
  - [x] Создать enum для типов файлов `app/Enums/FileType.php`
  - [x] Создать DTO для файловых операций `app/DTOs/FileUploadDTO.php`

- [x] **Раздел 3: Реализация основных методов**
  - [x] Метод `upload()` - загрузка файла на S3
  - [x] Метод `uploadMultiple()` - загрузка нескольких файлов
  - [x] Метод `delete()` - удаление файла
  - [x] Метод `deleteMultiple()` - удаление нескольких файлов
  - [x] Метод `getUrl()` - получение публичного URL
  - [x] Метод `getTemporaryUrl()` - получение временного URL
  - [x] Метод `exists()` - проверка существования файла
  - [x] Метод `move()` - перемещение файла между директориями

- [x] **Раздел 4: Валидация и обработка ошибок**
  - [x] Создать класс валидации `app/Services/FileValidator.php`
  - [x] Валидация размера файла
  - [x] Валидация MIME типов
  - [x] Валидация расширений
  - [x] Создать кастомные исключения `app/Exceptions/FileUploadException.php`

- [x] **Раздел 5: Утилиты и хелперы**
  - [x] Метод генерации уникальных имен файлов
  - [x] Метод определения директории по типу файла
  - [x] Метод получения метаданных файла

- [x] **Раздел 6: Интеграция с существующим кодом**
  - [x] Зарегистрировать сервис в AppServiceProvider

- [x] **Раздел 7: Тестирование**
  - [x] Создать тесты для FileService
  - [x] Тестирование загрузки файлов
  - [x] Тестирование удаления файлов
  - [x] Тестирование валидации
  - [x] Тестирование обработки ошибок
  - [x] Все 10 тестов прошли успешно ✅

- [x] **Раздел 8: Документация**
  - [x] Добавить PHPDoc комментарии
  - [x] Создать примеры использования

- [x] **Раздел 9: Проверка кода**
  - [x] Запустить Laravel Pint ✅ (8 файлов, 7 style issues исправлено)

## Технические требования

### API FileService

```php
interface FileServiceInterface
{
    // Загрузка
    public function upload(UploadedFile $file, FileUploadDTO $dto): string;
    public function uploadMultiple(array $files, FileUploadDTO $dto): array;

    // Удаление
    public function delete(string $path): bool;
    public function deleteMultiple(array $paths): bool;

    // URL
    public function getUrl(string $path): string;
    public function getTemporaryUrl(string $path, int $expiration = 60): string;

    // Утилиты
    public function exists(string $path): bool;
    public function move(string $from, string $to): bool;
    public function getMetadata(string $path): array;
}
```

### FileUploadDTO структура

```php
class FileUploadDTO
{
    public function __construct(
        public readonly FileType $fileType,
        public readonly ?string $directory = null,
        public readonly ?string $filename = null,
        public readonly string $visibility = 'private',
        public readonly bool $generateUniqueName = true,
        public readonly ?int $maxSize = null,
        public readonly ?array $allowedMimes = null,
        public readonly ?array $allowedExtensions = null,
    ) {}
}
```

### FileType enum

```php
enum FileType: string
{
    case IMAGE = 'image';
    case DOCUMENT = 'document';
    case VIDEO = 'video';
    case AUDIO = 'audio';
    case OTHER = 'other';

    public function getDirectory(): string;
    public function getAllowedMimes(): array;
    public function getMaxSize(): int;
}
```

### Структура директорий на S3

```
s3://bucket/
├── brands/
│   ├── admin/
│   │   ├── images/
│   │   ├── documents/
│   │   └── videos/
│   └── {brand_id}/
│       ├── images/
│       ├── documents/
│       └── videos/
└── temp/
    └── uploads/
```

### Пример использования

```php
// В контроллере или форме
use App\Services\FileService;
use App\DTOs\FileUploadDTO;
use App\Enums\FileType;

class ImageController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    public function store(Request $request)
    {
        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'brands/' . auth()->user()->getBrand()->id,
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        );

        $path = $this->fileService->upload($request->file('image'), $dto);

        $image = Image::create([
            'src' => $path,
            'name' => $request->file('image')->getClientOriginalName(),
        ]);

        return response()->json([
            'path' => $path,
            'url' => $this->fileService->getUrl($path),
        ]);
    }
}
```

## Дополнительные возможности (опционально)

- [ ] Поддержка нескольких дисков (S3, local, etc.)
- [ ] Генерация thumbnails для изображений
- [ ] Автоматическая очистка старых временных файлов
- [ ] Интеграция с очередями для тяжелых операций
- [ ] Логирование всех файловых операций
- [ ] Кеширование метаданных файлов

## Примечания

- Сервис должен быть stateless
- Все методы должны быть type-hinted
- Использовать современные PHP фичи (readonly properties, enums)
- Покрыть тестами критичные методы
- Следовать PSR-12 code style
- Использовать dependency injection