<?php

namespace Tests\Feature;

use App\DTOs\FileUploadDTO;
use App\Enums\FileType;
use App\Exceptions\FileUploadException;
use App\Services\FileService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileServiceTest extends TestCase
{
    protected FileService $fileService;

    protected function setUp(): void
    {
        parent::setUp();

        // Use fake storage for testing
        Storage::fake('s3');

        $this->fileService = app(FileService::class);
    }

    public function test_can_upload_file(): void
    {
        $file = UploadedFile::fake()->image('test.jpg', 100, 100);

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertNotEmpty($path);
        $this->assertTrue($this->fileService->exists($path));
    }

    public function test_can_upload_multiple_files(): void
    {
        $files = [
            UploadedFile::fake()->image('test1.jpg'),
            UploadedFile::fake()->image('test2.jpg'),
        ];

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $paths = $this->fileService->uploadMultiple($files, $dto);

        $this->assertCount(2, $paths);

        foreach ($paths as $path) {
            $this->assertTrue($this->fileService->exists($path));
        }
    }

    public function test_validates_file_size(): void
    {
        $file = UploadedFile::fake()->image('large.jpg')->size(15000); // 15MB

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            maxSize: 1024 * 1024 // 1MB
        );

        $this->expectException(FileUploadException::class);
        $this->expectExceptionMessage('exceeds maximum allowed size');

        $this->fileService->upload($file, $dto);
    }

    public function test_validates_mime_type(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE // Images don't allow PDF
        );

        $this->expectException(FileUploadException::class);
        $this->expectExceptionMessage('is not allowed');

        $this->fileService->upload($file, $dto);
    }

    public function test_can_delete_file(): void
    {
        $file = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertTrue($this->fileService->exists($path));

        $this->fileService->delete($path);

        $this->assertFalse($this->fileService->exists($path));
    }

    public function test_can_get_file_url(): void
    {
        $file = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $url = $this->fileService->getUrl($path);

        $this->assertNotEmpty($url);
        $this->assertStringContainsString($path, $url);
    }

    public function test_can_check_file_exists(): void
    {
        $file = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertTrue($this->fileService->exists($path));
        $this->assertFalse($this->fileService->exists('nonexistent/path.jpg'));
    }

    public function test_can_get_file_metadata(): void
    {
        $file = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $metadata = $this->fileService->getMetadata($path);

        $this->assertArrayHasKey('path', $metadata);
        $this->assertArrayHasKey('size', $metadata);
        $this->assertArrayHasKey('mime_type', $metadata);
        $this->assertArrayHasKey('url', $metadata);
    }

    public function test_generates_unique_filename_by_default(): void
    {
        $file1 = UploadedFile::fake()->image('test.jpg');
        $file2 = UploadedFile::fake()->image('test.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path1 = $this->fileService->upload($file1, $dto);
        $path2 = $this->fileService->upload($file2, $dto);

        $this->assertNotEquals($path1, $path2);
    }

    public function test_can_preserve_original_filename(): void
    {
        $file = UploadedFile::fake()->image('original-name.jpg');

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test',
            preserveOriginalName: true
        );

        $path = $this->fileService->upload($file, $dto);

        // Basename is preserved, but the image is converted to WebP
        $this->assertStringContainsString('original-name.webp', $path);
    }

    public function test_converts_uploaded_image_to_webp(): void
    {
        $file = UploadedFile::fake()->image('photo.jpg', 500, 400);

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertStringEndsWith('.webp', $path);

        $info = getimagesizefromstring(Storage::disk('s3')->get($path));

        $this->assertSame('image/webp', $info['mime']);
    }

    public function test_downscales_oversized_image(): void
    {
        $file = UploadedFile::fake()->image('huge.jpg', 3000, 1500);

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        [$width, $height] = getimagesizefromstring(Storage::disk('s3')->get($path));

        $this->assertSame(2000, $width);
        $this->assertSame(1000, $height); // aspect ratio preserved
    }

    public function test_does_not_convert_svg(): void
    {
        $svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';
        $file = UploadedFile::fake()->createWithContent('icon.svg', $svg);

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertStringEndsWith('.svg', $path);
        $this->assertSame($svg, Storage::disk('s3')->get($path));
    }

    public function test_non_image_files_are_uploaded_untouched(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $dto = new FileUploadDTO(
            fileType: FileType::DOCUMENT,
            directory: 'test'
        );

        $path = $this->fileService->upload($file, $dto);

        $this->assertStringEndsWith('.pdf', $path);
    }
}
