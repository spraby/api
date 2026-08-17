<?php

namespace Tests\Feature;

use App\Models\Image;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MigrateImagesToWebpCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
    }

    private function makePngContents(int $width = 100, int $height = 100): string
    {
        $gd = imagecreatetruecolor($width, $height);

        ob_start();
        imagepng($gd);

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

    public function test_converts_png_to_webp_and_updates_src(): void
    {
        $image = $this->createStoredImage('brands/1/images/photo.png', $this->makePngContents());

        $this->artisan('images:migrate-webp')->assertSuccessful();

        $image->refresh();

        $this->assertSame('brands/1/images/photo.webp', $image->src);
        $this->assertTrue(Storage::disk('s3')->exists('brands/1/images/photo.webp'));
        $this->assertFalse(Storage::disk('s3')->exists('brands/1/images/photo.png'));

        $info = getimagesizefromstring(Storage::disk('s3')->get('brands/1/images/photo.webp'));

        $this->assertSame('image/webp', $info['mime']);
    }

    public function test_keep_original_option_preserves_source_file(): void
    {
        $image = $this->createStoredImage('brands/1/images/photo.png', $this->makePngContents());

        $this->artisan('images:migrate-webp', ['--keep-original' => true])->assertSuccessful();

        $image->refresh();

        $this->assertSame('brands/1/images/photo.webp', $image->src);
        $this->assertTrue(Storage::disk('s3')->exists('brands/1/images/photo.png'));
    }

    public function test_dry_run_changes_nothing(): void
    {
        $image = $this->createStoredImage('brands/1/images/photo.png', $this->makePngContents());

        $this->artisan('images:migrate-webp', ['--dry-run' => true])->assertSuccessful();

        $image->refresh();

        $this->assertSame('brands/1/images/photo.png', $image->src);
        $this->assertFalse(Storage::disk('s3')->exists('brands/1/images/photo.webp'));
    }

    public function test_skips_non_convertible_extensions(): void
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg"/>';
        $svgImage = $this->createStoredImage('brands/1/images/icon.svg', $svg);

        $externalImage = Image::create([
            'name' => 'external.png',
            'src' => 'https://via.placeholder.com/640x480.png/00dd77?text=products',
        ]);

        $this->artisan('images:migrate-webp')->assertSuccessful();

        $this->assertSame('brands/1/images/icon.svg', $svgImage->refresh()->src);
        $this->assertSame($svg, Storage::disk('s3')->get('brands/1/images/icon.svg'));
        $this->assertStringStartsWith('https://', $externalImage->refresh()->src);
    }

    public function test_missing_file_is_reported_as_failure_without_touching_record(): void
    {
        $image = Image::create([
            'name' => 'ghost.png',
            'src' => 'brands/1/images/ghost.png',
        ]);

        $this->artisan('images:migrate-webp')->assertFailed();

        $this->assertSame('brands/1/images/ghost.png', $image->refresh()->src);
    }

    public function test_limit_option_stops_after_given_count(): void
    {
        $first = $this->createStoredImage('brands/1/images/a.png', $this->makePngContents());
        $second = $this->createStoredImage('brands/1/images/b.png', $this->makePngContents());

        $this->artisan('images:migrate-webp', ['--limit' => 1])->assertSuccessful();

        $this->assertSame('brands/1/images/a.webp', $first->refresh()->src);
        $this->assertSame('brands/1/images/b.png', $second->refresh()->src);
    }
}
