<?php

namespace Tests\Unit;

use App\Services\ImageRenditions;
use PHPUnit\Framework\TestCase;

class ImageRenditionsTest extends TestCase
{
    public function test_builds_rendition_path_with_width_suffix(): void
    {
        $this->assertSame(
            'brands/7/images/abc_400.webp',
            ImageRenditions::path('brands/7/images/abc.webp', 400)
        );
    }

    public function test_builds_rendition_path_for_file_without_directory(): void
    {
        $this->assertSame('abc_800.webp', ImageRenditions::path('abc.webp', 800));
    }

    public function test_paths_cover_every_configured_width_for_webp(): void
    {
        $paths = ImageRenditions::paths('brands/7/images/abc.webp');

        $this->assertSame(ImageRenditions::WIDTHS, array_keys($paths));
        $this->assertSame('brands/7/images/abc_400.webp', $paths[400]);
        $this->assertSame('brands/7/images/abc_800.webp', $paths[800]);
    }

    public function test_paths_are_empty_for_formats_without_renditions(): void
    {
        $this->assertSame([], ImageRenditions::paths('brands/7/images/anim.gif'));
        $this->assertSame([], ImageRenditions::paths('brands/7/images/icon.svg'));
        $this->assertSame([], ImageRenditions::paths('brands/7/images/legacy.jpg'));
    }

    public function test_paths_are_empty_for_external_urls(): void
    {
        $this->assertSame([], ImageRenditions::paths('https://example.com/photo.webp'));
    }

    public function test_all_paths_lists_original_first_then_renditions(): void
    {
        $this->assertSame(
            ['brands/7/images/abc.webp', 'brands/7/images/abc_400.webp', 'brands/7/images/abc_800.webp'],
            ImageRenditions::allPaths('brands/7/images/abc.webp')
        );
    }

    public function test_all_paths_is_only_the_original_when_unsupported(): void
    {
        $this->assertSame(['brands/7/images/anim.gif'], ImageRenditions::allPaths('brands/7/images/anim.gif'));
    }
}
