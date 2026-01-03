<?php

namespace App\Services;

use App\DTOs\FileUploadDTO;
use App\Exceptions\FileUploadException;
use Illuminate\Http\UploadedFile;

/**
 * Validator for uploaded files
 */
class FileValidator
{
    /**
     * Validate uploaded file against DTO configuration
     *
     * @param  UploadedFile  $file  File to validate
     * @param  FileUploadDTO  $dto  Configuration
     *
     * @throws FileUploadException
     */
    public function validate(UploadedFile $file, FileUploadDTO $dto): void
    {
        $this->validateSize($file, $dto);
        $this->validateMimeType($file, $dto);
        $this->validateExtension($file, $dto);
    }

    /**
     * Validate file size
     *
     * @param  UploadedFile  $file  File to validate
     * @param  FileUploadDTO  $dto  Configuration
     *
     * @throws FileUploadException
     */
    protected function validateSize(UploadedFile $file, FileUploadDTO $dto): void
    {
        $maxSize = $dto->getMaxSize();

        if ($file->getSize() > $maxSize) {
            throw FileUploadException::invalidFileSize($file->getSize(), $maxSize);
        }
    }

    /**
     * Validate file MIME type
     *
     * @param  UploadedFile  $file  File to validate
     * @param  FileUploadDTO  $dto  Configuration
     *
     * @throws FileUploadException
     */
    protected function validateMimeType(UploadedFile $file, FileUploadDTO $dto): void
    {
        $allowedMimes = $dto->getAllowedMimes();

        // Skip validation if no MIME types specified
        if (empty($allowedMimes)) {
            return;
        }

        $mimeType = $file->getMimeType();

        if (! in_array($mimeType, $allowedMimes, true)) {
            throw FileUploadException::invalidMimeType($mimeType, $allowedMimes);
        }
    }

    /**
     * Validate file extension
     *
     * @param  UploadedFile  $file  File to validate
     * @param  FileUploadDTO  $dto  Configuration
     *
     * @throws FileUploadException
     */
    protected function validateExtension(UploadedFile $file, FileUploadDTO $dto): void
    {
        $allowedExtensions = $dto->getAllowedExtensions();

        // Skip validation if no extensions specified
        if (empty($allowedExtensions)) {
            return;
        }

        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, $allowedExtensions, true)) {
            throw FileUploadException::invalidExtension($extension, $allowedExtensions);
        }
    }
}
