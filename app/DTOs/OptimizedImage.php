<?php

namespace App\DTOs;

/**
 * Result of ImageOptimizer: the WebP original plus its downscaled copies
 */
readonly class OptimizedImage
{
    /**
     * @param  string  $original  Binary WebP, longer side up to ImageOptimizer::MAX_DIMENSION
     * @param  array<int, string>  $renditions  Binary WebP copies keyed by longer-side width (ImageRenditions::WIDTHS)
     */
    public function __construct(
        public string $original,
        public array $renditions,
    ) {}
}
