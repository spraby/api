<?php

namespace App\Services;

use App\DTOs\FileUploadDTO;
use App\DTOs\OptimizedImage;
use App\Enums\FileType;
use App\Exceptions\FileUploadException;
use App\Services\Contracts\FileServiceInterface;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
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
        protected ImageOptimizer $optimizer,
        string $diskName = 's3'
    ) {
        $this->disk = Storage::disk($diskName);
    }

    /**
     * {@inheritDoc}
     */
    public function upload(UploadedFile $file, FileUploadDTO $dto): string
    {
        $this->validator->validate($file, $dto);

        $optimized = $this->optimizeImage($file, $dto);
        $extensionOverride = $optimized ? ImageOptimizer::OUTPUT_EXTENSION : null;

        $filename = $this->generateFilename($file, $dto, $extensionOverride);
        $directory = $dto->getFullDirectory();
        $fullPath = $directory ? "{$directory}/{$filename}" : $filename;

        try {
            if ($optimized) {
                // Renditions go first: the original is what the database points to,
                // so a failure here must not leave an original without its copies
                $this->putRenditions($fullPath, $optimized->renditions, $dto->visibility);
                $this->putFile($fullPath, $optimized->original, $dto->visibility);
            } else {
                $this->putFile($fullPath, file_get_contents($file->getRealPath()), $dto->visibility);
            }

            return $fullPath;
        } catch (\Exception $e) {
            $this->disk->delete(ImageRenditions::allPaths($fullPath));

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
    public function putRenditions(string $originalPath, array $renditions, ?string $visibility = 'public'): void
    {
        foreach ($renditions as $width => $contents) {
            $this->putFile(ImageRenditions::path($originalPath, (int) $width), $contents, $visibility);
        }
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
            return $this->disk->delete(ImageRenditions::allPaths($path));
        } catch (\Exception $e) {
            throw FileUploadException::deleteFailed($path, $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function deleteMultiple(array $paths): bool
    {
        $pathsWithRenditions = array_merge(
            ...array_map(fn (string $path) => ImageRenditions::allPaths($path), $paths)
        );

        try {
            return $this->disk->delete($pathsWithRenditions);
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
     * Downscale and convert a raster image to WebP with its renditions.
     * Returns null when the file is not an optimizable image or optimization fails
     * (corrupt file, etc.), in which case the original is uploaded untouched.
     */
    protected function optimizeImage(UploadedFile $file, FileUploadDTO $dto): ?OptimizedImage
    {
        if ($dto->fileType !== FileType::IMAGE || ! $this->optimizer->supports($file)) {
            return null;
        }

        try {
            return $this->optimizer->optimize($file);
        } catch (\Exception $e) {
            Log::warning('[FileService.upload] image optimization failed, uploading original', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Write contents to storage and apply visibility
     *
     * @throws FileUploadException
     */
    protected function putFile(string $path, string $contents, ?string $visibility): void
    {
        // put() without a visibility argument for S3 compatibility; visibility is set separately
        if (! $this->disk->put($path, $contents)) {
            throw FileUploadException::uploadFailed("Storage operation returned false for {$path}");
        }

        if ($visibility) {
            $this->disk->setVisibility($path, $visibility);
        }
    }

    /**
     * Generate filename for uploaded file
     *
     * @param  UploadedFile  $file  File being uploaded
     * @param  FileUploadDTO  $dto  Upload configuration
     * @param  string|null  $extensionOverride  Extension to use instead of the original (e.g. after conversion)
     * @return string Generated filename
     */
    protected function generateFilename(UploadedFile $file, FileUploadDTO $dto, ?string $extensionOverride = null): string
    {
        $extension = $extensionOverride ?? $file->getClientOriginalExtension();

        // Use original filename if requested
        if ($dto->preserveOriginalName) {
            $basename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            return "{$basename}.{$extension}";
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
        $basename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        return "{$basename}.{$extension}";
    }
}
