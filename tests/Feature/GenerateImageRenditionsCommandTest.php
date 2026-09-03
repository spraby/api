<?php

namespace Tests\Feature;

use App\Models\Image;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GenerateImageRenditionsCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
    }

    private function makeWebpContents(int $width, int $height): string
    {
        $gd = imagecreatetruecolor($width, $height);

        ob_start();
        imagewebp($gd);

        return ob_get_clean();
    }

    private function createStoredImage(string $path, string $contents): Image
    {
        Storage::disk('s3')->put($path, $contents);

        return Image::create([
            'name' => basename($path),
            'src' => $path,
        ]);
    }

    private function assertStoredWidth(string $path, int $expectedWidth): void
    {
        $this->assertTrue(Storage::disk('s3')->exists($path), "{$path} was not stored");

        [$width] = getimagesizefromstring(Storage::disk('s3')->get($path));

        $this->assertSame($expectedWidth, $width, "{$path} has an unexpected width");
    }

    public function test_generates_missing_renditions_for_webp_originals(): void
    {
        $this->createStoredImage('brands/1/images/photo.webp', $this->makeWebpContents(1000, 500));

        $this->artisan('images:generate-renditions')
            ->expectsOutputToContain('Generated: 1, skipped: 0, failed: 0')
            ->assertSuccessful();

        $this->assertStoredWidth('brands/1/images/photo_800.webp', 800);
        $this->assertStoredWidth('brands/1/images/photo_400.webp', 400);
    }

    public function test_skips_images_that_already_have_all_renditions(): void
    {
        $this->createStoredImage('brands/1/images/photo.webp', $this->makeWebpContents(1000, 500));
        Storage::disk('s3')->put('brands/1/images/photo_400.webp', 'existing-400');
        Storage::disk('s3')->put('brands/1/images/photo_800.webp', 'existing-800');

        $this->artisan('images:generate-renditions')
            ->expectsOutputToContain('Generated: 0, skipped: 1, failed: 0')
            ->assertSuccessful();

        $this->assertSame('existing-400', Storage::disk('s3')->get('brands/1/images/photo_400.webp'));
        $this->assertSame('existing-800', Storage::disk('s3')->get('brands/1/images/photo_800.webp'));
    }

    public function test_generates_only_the_missing_rendition(): void
    {
        $this->createStoredImage('brands/1/images/photo.webp', $this->makeWebpContents(1000, 500));
        Storage::disk('s3')->put('brands/1/images/photo_800.webp', 'existing-800');

        $this->artisan('images:generate-renditions')->assertSuccessful();

        $this->assertStoredWidth('brands/1/images/photo_400.webp', 400);
        $this->assertSame('existing-800', Storage::disk('s3')->get('brands/1/images/photo_800.webp'));
    }

    public function test_force_option_regenerates_existing_renditions(): void
    {
        $this->createStoredImage('brands/1/images/photo.webp', $this->makeWebpContents(1000, 500));
        Storage::disk('s3')->put('brands/1/images/photo_400.webp', 'stale-400');
        Storage::disk('s3')->put('brands/1/images/photo_800.webp', 'stale-800');

        $this->artisan('images:generate-renditions', ['--force' => true])->assertSuccessful();

        $this->assertStoredWidth('brands/1/images/photo_400.webp', 400);
        $this->assertStoredWidth('brands/1/images/photo_800.webp', 800);
    }

    public function test_skips_formats_and_external_sources_without_renditions(): void
    {
        $this->createStoredImage('brands/1/images/anim.gif', 'GIF89a');
        Image::create(['name' => 'placeholder', 'src' => 'https://via.placeholder.com/640x480.png']);

        $this->artisan('images:generate-renditions')
            ->expectsOutputToContain('Generated: 0, skipped: 2, failed: 0')
            ->assertSuccessful();

        $this->assertFalse(Storage::disk('s3')->exists('brands/1/images/anim_400.gif'));
    }

    public function test_dry_run_reports_without_writing(): void
    {
        $this->createStoredImage('brands/1/images/photo.webp', $this->makeWebpContents(1000, 500));

        $this->artisan('images:generate-renditions', ['--dry-run' => true])
            ->expectsOutputToContain('Would generate: brands/1/images/photo.webp')
            ->assertSuccessful();

        $this->assertFalse(Storage::disk('s3')->exists('brands/1/images/photo_400.webp'));
        $this->assertFalse(Storage::disk('s3')->exists('brands/1/images/photo_800.webp'));
    }

    public function test_reports_failure_when_original_is_missing_in_storage(): void
    {
        Image::create(['name' => 'gone', 'src' => 'brands/1/images/gone.webp']);

        $this->artisan('images:generate-renditions')
            ->expectsOutputToContain('Generated: 0, skipped: 0, failed: 1')
            ->assertFailed();
    }

    public function test_limit_option_caps_processed_images(): void
    {
        $this->createStoredImage('brands/1/images/one.webp', $this->makeWebpContents(100, 100));
        $this->createStoredImage('brands/1/images/two.webp', $this->makeWebpContents(100, 100));

        $this->artisan('images:generate-renditions', ['--limit' => 1])
            ->expectsOutputToContain('Generated: 1,')
            ->assertSuccessful();
    }
}
