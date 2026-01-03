<?php

namespace App\Enums;

enum FileType: string
{
    case IMAGE = 'image';
    case DOCUMENT = 'document';
    case VIDEO = 'video';
    case AUDIO = 'audio';
    case OTHER = 'other';

    /**
     * Get directory path for this file type
     */
    public function getDirectory(): string
    {
        return match ($this) {
            self::IMAGE => 'images',
            self::DOCUMENT => 'documents',
            self::VIDEO => 'videos',
            self::AUDIO => 'audio',
            self::OTHER => 'files',
        };
    }

    /**
     * Get allowed MIME types for this file type
     *
     * @return array<string>
     */
    public function getAllowedMimes(): array
    {
        return match ($this) {
            self::IMAGE => [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ],
            self::DOCUMENT => [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'text/csv',
            ],
            self::VIDEO => [
                'video/mp4',
                'video/mpeg',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm',
            ],
            self::AUDIO => [
                'audio/mpeg',
                'audio/wav',
                'audio/ogg',
                'audio/mp4',
            ],
            self::OTHER => [],
        };
    }

    /**
     * Get allowed file extensions for this file type
     *
     * @return array<string>
     */
    public function getAllowedExtensions(): array
    {
        return match ($this) {
            self::IMAGE => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            self::DOCUMENT => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
            self::VIDEO => ['mp4', 'mpeg', 'mov', 'avi', 'webm'],
            self::AUDIO => ['mp3', 'wav', 'ogg', 'm4a'],
            self::OTHER => [],
        };
    }

    /**
     * Get maximum file size in bytes for this file type
     */
    public function getMaxSize(): int
    {
        return match ($this) {
            self::IMAGE => 10 * 1024 * 1024, // 10MB
            self::DOCUMENT => 20 * 1024 * 1024, // 20MB
            self::VIDEO => 100 * 1024 * 1024, // 100MB
            self::AUDIO => 50 * 1024 * 1024, // 50MB
            self::OTHER => 50 * 1024 * 1024, // 50MB
        };
    }
}
