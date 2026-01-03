<?php

namespace App\DTOs;

use App\Enums\FileType;

/**
 * Data Transfer Object for file upload configuration
 */
readonly class FileUploadDTO
{
    /**
     * @param  FileType  $fileType  File type (image, document, video, etc.)
     * @param  string|null  $directory  Custom directory path (relative to disk root)
     * @param  string|null  $filename  Custom filename (without extension)
     * @param  string  $visibility  File visibility (public or private)
     * @param  bool  $generateUniqueName  Generate unique filename to avoid conflicts
     * @param  int|null  $maxSize  Maximum file size in bytes (null uses default from FileType)
     * @param  array<string>|null  $allowedMimes  Allowed MIME types (null uses default from FileType)
     * @param  array<string>|null  $allowedExtensions  Allowed file extensions (null uses default from FileType)
     * @param  bool  $preserveOriginalName  Preserve original filename (overrides generateUniqueName)
     */
    public function __construct(
        public FileType $fileType,
        public ?string $directory = null,
        public ?string $filename = null,
        public string $visibility = 'private',
        public bool $generateUniqueName = true,
        public ?int $maxSize = null,
        public ?array $allowedMimes = null,
        public ?array $allowedExtensions = null,
        public bool $preserveOriginalName = false,
    ) {}

    /**
     * Get the actual maximum file size (from custom or FileType default)
     */
    public function getMaxSize(): int
    {
        return $this->maxSize ?? $this->fileType->getMaxSize();
    }

    /**
     * Get the actual allowed MIME types (from custom or FileType default)
     *
     * @return array<string>
     */
    public function getAllowedMimes(): array
    {
        return $this->allowedMimes ?? $this->fileType->getAllowedMimes();
    }

    /**
     * Get the actual allowed extensions (from custom or FileType default)
     *
     * @return array<string>
     */
    public function getAllowedExtensions(): array
    {
        return $this->allowedExtensions ?? $this->fileType->getAllowedExtensions();
    }

    /**
     * Get the full directory path including file type subdirectory
     */
    public function getFullDirectory(): string
    {
        $parts = array_filter([
            $this->directory,
            $this->fileType->getDirectory(),
        ]);

        return implode('/', $parts);
    }
}
