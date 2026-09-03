<?php

namespace App\Services;

/**
 * Naming rules for downscaled copies ("renditions") stored next to a WebP original.
 *
 *   brands/1/images/{uuid}.webp       original, longer side up to ImageOptimizer::MAX_DIMENSION
 *   brands/1/images/{uuid}_800.webp   rendition, longer side 800 px
 *   brands/1/images/{uuid}_400.webp   rendition, longer side 400 px
 *
 * Only the original path is stored in the database. The storefront derives
 * rendition URLs from it with the same rules (store/lib/image-loader.ts),
 * so WIDTHS must stay in sync between the two projects.
 */
final class ImageRenditions
{
    /**
     * Longer-side widths in px. Must match RENDITION_WIDTHS in store/lib/image-loader.ts.
     *
     * @var array<int>
     */
    public const WIDTHS = [400, 800];

    private const SUFFIX_SEPARATOR = '_';

    /**
     * Whether renditions are produced for this stored path.
     * Only WebP files written by ImageOptimizer qualify; GIF/SVG pass through
     * untouched and external URLs are not ours to resize.
     */
    public static function supports(string $path): bool
    {
        if (preg_match('#^https?://#i', $path) === 1) {
            return false;
        }

        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) === ImageOptimizer::OUTPUT_EXTENSION;
    }

    /**
     * Storage path of the rendition with the given width
     */
    public static function path(string $originalPath, int $width): string
    {
        $directory = pathinfo($originalPath, PATHINFO_DIRNAME);
        $basename = pathinfo($originalPath, PATHINFO_FILENAME);
        $extension = pathinfo($originalPath, PATHINFO_EXTENSION);

        $filename = $basename.self::SUFFIX_SEPARATOR.$width.'.'.$extension;

        return in_array($directory, ['', '.'], true) ? $filename : "{$directory}/{$filename}";
    }

    /**
     * Storage paths of every rendition of the original, keyed by width.
     * Empty for paths that do not get renditions.
     *
     * @return array<int, string>
     */
    public static function paths(string $originalPath): array
    {
        if (! self::supports($originalPath)) {
            return [];
        }

        $paths = [];

        foreach (self::WIDTHS as $width) {
            $paths[$width] = self::path($originalPath, $width);
        }

        return $paths;
    }

    /**
     * Original plus its renditions: everything that has to be removed together
     *
     * @return array<string>
     */
    public static function allPaths(string $originalPath): array
    {
        return [$originalPath, ...array_values(self::paths($originalPath))];
    }
}
