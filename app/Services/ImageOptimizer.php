<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Optimizes uploaded raster images: downscales oversized images
 * and re-encodes them as WebP.
 */
class ImageOptimizer
{
    /** Maximum width/height in pixels; larger images are scaled down proportionally */
    public const MAX_DIMENSION = 2000;

    /** WebP encoding quality (0-100) */
    public const WEBP_QUALITY = 82;

    public const OUTPUT_EXTENSION = 'webp';

    /**
     * GIF is skipped to preserve animation, SVG is vector and not readable by GD.
     *
     * @var array<string>
     */
    private const OPTIMIZABLE_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /**
     * Whether the file can be optimized by this service
     */
    public function supports(UploadedFile $file): bool
    {
        return in_array($file->getMimeType(), self::OPTIMIZABLE_MIMES, true);
    }

    /**
     * Downscale to MAX_DIMENSION and encode as WebP
     *
     * @return string Binary WebP contents
     */
    public function optimize(UploadedFile $file): string
    {
        return $this->optimizeBinary(file_get_contents($file->getRealPath()));
    }

    /**
     * Same as optimize(), but for raw image contents (e.g. read from storage)
     *
     * @param  string  $contents  Binary image contents
     * @return string Binary WebP contents
     */
    public function optimizeBinary(string $contents): string
    {
        $manager = new ImageManager(new Driver());

        $image = $manager->decodeBinary($contents);
        $image->scaleDown(self::MAX_DIMENSION, self::MAX_DIMENSION);

        return (string) $image->encode(new WebpEncoder(quality: self::WEBP_QUALITY));
    }
}
