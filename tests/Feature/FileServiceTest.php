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

        $this->assertStringContainsString('original-name.jpg', $path);
    }
}
