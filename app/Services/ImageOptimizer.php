<?php

namespace App\Services;

use App\DTOs\OptimizedImage;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * Optimizes uploaded raster images: downscales oversized images,
 * re-encodes them as WebP and produces the downscaled copies
 * the storefront serves instead of resizing on the fly.
 */
class ImageOptimizer
{
    /** Maximum width/height in pixels; larger images are scaled down proportionally */
    public const MAX_DIMENSION = 2000;

    /** WebP encoding quality (0-100) */
    public const WEBP_QUALITY = 82;

    /**
     * Refuse to decode anything above this pixel count: GD holds the full
     * uncompressed bitmap in memory (~5 bytes/pixel), so a huge image can
     * kill the process before any catchable error is thrown.
     */
    public const MAX_PIXELS = 60_000_000;

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
     * Downscale to MAX_DIMENSION, encode as WebP and build renditions
     *
     * @throws \RuntimeException When the image is too large to decode safely
     */
    public function optimize(UploadedFile $file): OptimizedImage
    {
        return $this->optimizeBinary(file_get_contents($file->getRealPath()));
    }

    /**
     * Same as optimize(), but for raw image contents (e.g. read from storage)
     *
     * @param  string  $contents  Binary image contents
     *
     * @throws \RuntimeException When the image is too large to decode safely
     */
    public function optimizeBinary(string $contents): OptimizedImage
    {
        $image = $this->decode($contents);
        $image->scaleDown(self::MAX_DIMENSION, self::MAX_DIMENSION);

        // The original is encoded before renditionsOf() shrinks the bitmap in place
        $original = $this->encodeWebp($image);

        return new OptimizedImage($original, $this->renditionsOf($image));
    }

    /**
     * Build renditions for an image that is already optimized (e.g. to backfill existing files)
     *
     * @param  string  $contents  Binary image contents
     * @return array<int, string> Binary WebP copies keyed by width
     *
     * @throws \RuntimeException When the image is too large to decode safely
     */
    public function renditions(string $contents): array
    {
        return $this->renditionsOf($this->decode($contents));
    }

    /**
     * @throws \RuntimeException
     */
    private function decode(string $contents): ImageInterface
    {
        $info = getimagesizefromstring($contents);

        if ($info !== false && $info[0] * $info[1] > self::MAX_PIXELS) {
            throw new \RuntimeException(
                "Image is too large to optimize safely ({$info[0]}x{$info[1]} px)"
            );
        }

        return (new ImageManager(new Driver))->decodeBinary($contents);
    }

    /**
     * Largest width first: every step downscales the previous result in place,
     * so the full-size bitmap is decoded only once. Mutates $image.
     *
     * @return array<int, string>
     */
    private function renditionsOf(ImageInterface $image): array
    {
        $widths = ImageRenditions::WIDTHS;
        rsort($widths);

        $renditions = [];

        foreach ($widths as $width) {
            // scaleDown never enlarges, so small originals get same-size copies
            // and the storefront can rely on every rendition existing
            $image->scaleDown($width, $width);
            $renditions[$width] = $this->encodeWebp($image);
        }

        return $renditions;
    }

    private function encodeWebp(ImageInterface $image): string
    {
        return (string) $image->encode(new WebpEncoder(quality: self::WEBP_QUALITY));
    }
}
