<?php

namespace App\Services;

use App\DTOs\FileUploadDTO;
use App\Exceptions\FileUploadException;
use App\Services\Contracts\FileServiceInterface;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service for managing file uploads and storage operations
 */
class FileService implements FileServiceInterface
{
    protected Filesystem $disk;

    public function __construct(
        protected FileValidator $validator,
        string $diskName = 's3'
    ) {
        $this->disk = Storage::disk($diskName);
    }

    /**
     * {@inheritDoc}
     */
    public function upload(UploadedFile $file, FileUploadDTO $dto): string
    {
        // Validate file
        $this->validator->validate($file, $dto);

        // Generate filename
        $filename = $this->generateFilename($file, $dto);

        // Get directory path
        $directory = $dto->getFullDirectory();

        // Build full path
        $path = $directory ? "{$directory}/{$filename}" : $filename;

        // Upload file
        try {
            $uploaded = $file->storeAs(
                $directory,
                $filename,
                [
                    'disk' => $this->disk->getConfig()['driver'] ?? 's3',
                    'visibility' => $dto->visibility,
                ]
            );

            if (! $uploaded) {
                throw FileUploadException::uploadFailed('Storage operation returned false');
            }

            return $uploaded;
        } catch (\Exception $e) {
            throw FileUploadException::uploadFailed($e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function uploadMultiple(array $files, FileUploadDTO $dto): array
    {
        $uploadedPaths = [];

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $uploadedPaths[] = $this->upload($file, $dto);
        }

        return $uploadedPaths;
    }

    /**
     * {@inheritDoc}
     */
    public function delete(string $path): bool
    {
        if (! $this->exists($path)) {
            throw FileUploadException::fileNotFound($path);
        }

        try {
            return $this->disk->delete($path);
        } catch (\Exception $e) {
            throw FileUploadException::deleteFailed($path, $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function deleteMultiple(array $paths): bool
    {
        try {
            return $this->disk->delete($paths);
        } catch (\Exception $e) {
            throw FileUploadException::deleteFailed(implode(', ', $paths), $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function getUrl(string $path): string
    {
        return $this->disk->url($path);
    }

    /**
     * {@inheritDoc}
     */
    public function getTemporaryUrl(string $path, int $expiration = 60): string
    {
        if (! $this->exists($path)) {
            throw FileUploadException::fileNotFound($path);
        }

        return $this->disk->temporaryUrl($path, now()->addMinutes($expiration));
    }

    /**
     * {@inheritDoc}
     */
    public function exists(string $path): bool
    {
        return $this->disk->exists($path);
    }

    /**
     * {@inheritDoc}
     */
    public function move(string $from, string $to): bool
    {
        if (! $this->exists($from)) {
            throw FileUploadException::fileNotFound($from);
        }

        try {
            return $this->disk->move($from, $to);
        } catch (\Exception $e) {
            throw FileUploadException::moveFailed($from, $to, $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function getMetadata(string $path): array
    {
        if (! $this->exists($path)) {
            throw FileUploadException::fileNotFound($path);
        }

        return [
            'path' => $path,
            'size' => $this->disk->size($path),
            'last_modified' => $this->disk->lastModified($path),
            'mime_type' => $this->disk->mimeType($path),
            'url' => $this->getUrl($path),
        ];
    }

    /**
     * Generate filename for uploaded file
     *
     * @param  UploadedFile  $file  File being uploaded
     * @param  FileUploadDTO  $dto  Upload configuration
     * @return string Generated filename
     */
    protected function generateFilename(UploadedFile $file, FileUploadDTO $dto): string
    {
        $extension = $file->getClientOriginalExtension();

        // Use original filename if requested
        if ($dto->preserveOriginalName) {
            return $file->getClientOriginalName();
        }

        // Use custom filename if provided
        if ($dto->filename) {
            return "{$dto->filename}.{$extension}";
        }

        // Generate unique filename
        if ($dto->generateUniqueName) {
            return Str::uuid().'.'.$extension;
        }

        // Use original filename
        return $file->getClientOriginalName();
    }
}
