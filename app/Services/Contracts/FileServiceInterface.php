<?php

namespace App\Services\Contracts;

use App\DTOs\FileUploadDTO;
use App\Exceptions\FileUploadException;
use Illuminate\Http\UploadedFile;

/**
 * Interface for file storage service
 */
interface FileServiceInterface
{
    /**
     * Upload a file to storage
     *
     * @param  UploadedFile  $file  File to upload
     * @param  FileUploadDTO  $dto  Upload configuration
     * @return string Path to uploaded file
     *
     * @throws FileUploadException
     */
    public function upload(UploadedFile $file, FileUploadDTO $dto): string;

    /**
     * Upload multiple files to storage
     *
     * @param  array<UploadedFile>  $files  Files to upload
     * @param  FileUploadDTO  $dto  Upload configuration
     * @return array<string> Paths to uploaded files
     *
     * @throws FileUploadException
     */
    public function uploadMultiple(array $files, FileUploadDTO $dto): array;

    /**
     * Store downscaled copies next to an already stored WebP original
     * (paths follow ImageRenditions rules)
     *
     * @param  string  $originalPath  Path of the original the copies belong to
     * @param  array<int, string>  $renditions  Binary WebP copies keyed by width
     * @param  string|null  $visibility  File visibility (public or private), null to leave the disk default
     *
     * @throws FileUploadException
     */
    public function putRenditions(string $originalPath, array $renditions, ?string $visibility = 'public'): void;

    /**
     * Delete a file and its renditions from storage
     *
     * @param  string  $path  Path to file
     * @return bool Success status
     *
     * @throws FileUploadException
     */
    public function delete(string $path): bool;

    /**
     * Delete multiple files and their renditions from storage
     *
     * @param  array<string>  $paths  Paths to files
     * @return bool Success status
     *
     * @throws FileUploadException
     */
    public function deleteMultiple(array $paths): bool;

    /**
     * Get public URL for a file
     *
     * @param  string  $path  Path to file
     * @return string Public URL
     */
    public function getUrl(string $path): string;

    /**
     * Get temporary URL for a private file
     *
     * @param  string  $path  Path to file
     * @param  int  $expiration  Expiration time in minutes
     * @return string Temporary URL
     */
    public function getTemporaryUrl(string $path, int $expiration = 60): string;

    /**
     * Check if file exists in storage
     *
     * @param  string  $path  Path to file
     * @return bool Existence status
     */
    public function exists(string $path): bool;

    /**
     * Move file to different location
     *
     * @param  string  $from  Source path
     * @param  string  $to  Destination path
     * @return bool Success status
     *
     * @throws FileUploadException
     */
    public function move(string $from, string $to): bool;

    /**
     * Get file metadata
     *
     * @param  string  $path  Path to file
     * @return array<string, mixed> File metadata
     *
     * @throws FileUploadException
     */
    public function getMetadata(string $path): array;
}
