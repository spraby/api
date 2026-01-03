<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when file upload or file operations fail
 */
class FileUploadException extends Exception
{
    public static function invalidFileSize(int $size, int $maxSize): self
    {
        $sizeMB = round($size / 1024 / 1024, 2);
        $maxSizeMB = round($maxSize / 1024 / 1024, 2);

        return new self("File size ({$sizeMB}MB) exceeds maximum allowed size ({$maxSizeMB}MB)");
    }

    public static function invalidMimeType(string $mimeType, array $allowedMimes): self
    {
        $allowed = implode(', ', $allowedMimes);

        return new self("File type '{$mimeType}' is not allowed. Allowed types: {$allowed}");
    }

    public static function invalidExtension(string $extension, array $allowedExtensions): self
    {
        $allowed = implode(', ', $allowedExtensions);

        return new self("File extension '{$extension}' is not allowed. Allowed extensions: {$allowed}");
    }

    public static function uploadFailed(string $message): self
    {
        return new self("File upload failed: {$message}");
    }

    public static function deleteFailed(string $path, string $message = ''): self
    {
        $msg = "Failed to delete file: {$path}";
        if ($message) {
            $msg .= ". Reason: {$message}";
        }

        return new self($msg);
    }

    public static function moveFailed(string $from, string $to, string $message = ''): self
    {
        $msg = "Failed to move file from '{$from}' to '{$to}'";
        if ($message) {
            $msg .= ". Reason: {$message}";
        }

        return new self($msg);
    }

    public static function fileNotFound(string $path): self
    {
        return new self("File not found: {$path}");
    }

    public static function invalidFile(string $message): self
    {
        return new self("Invalid file: {$message}");
    }
}
