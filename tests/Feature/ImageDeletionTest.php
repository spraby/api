<?php

namespace Tests\Feature;

use App\Models\Image;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageDeletionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
    }

    public function test_deleting_image_removes_original_and_renditions(): void
    {
        $disk = Storage::disk('s3');
        $disk->put('brands/1/images/photo.webp', 'original');
        $disk->put('brands/1/images/photo_400.webp', 'small');
        $disk->put('brands/1/images/photo_800.webp', 'medium');

        $image = Image::create(['name' => 'photo.webp', 'src' => 'brands/1/images/photo.webp']);

        $image->delete();

        $this->assertFalse($disk->exists('brands/1/images/photo.webp'));
        $this->assertFalse($disk->exists('brands/1/images/photo_400.webp'));
        $this->assertFalse($disk->exists('brands/1/images/photo_800.webp'));
    }

    public function test_deleting_image_without_renditions_still_removes_original(): void
    {
        $disk = Storage::disk('s3');
        $disk->put('brands/1/images/legacy.jpg', 'original');

        $image = Image::create(['name' => 'legacy.jpg', 'src' => 'brands/1/images/legacy.jpg']);

        $image->delete();

        $this->assertFalse($disk->exists('brands/1/images/legacy.jpg'));
    }
}
