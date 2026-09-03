<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Services\FileService;
use App\Services\ImageOptimizer;
use App\Services\ImageRenditions;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Backfills downscaled copies for images uploaded before renditions existed.
 * Safe to re-run: images that already have every rendition are skipped.
 */
class GenerateImageRenditionsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'images:generate-renditions
        {--dry-run : Only report what would be generated, without changing anything}
        {--force : Regenerate renditions even if they already exist}
        {--limit= : Max images to process in this run}';

    /**
     * @var string
     */
    protected $description = 'Create downscaled copies next to existing WebP images so the storefront can serve them without resizing';

    public function handle(ImageOptimizer $optimizer, FileService $files): int
    {
        // GD holds the full uncompressed bitmap in memory; the default 128M
        // limit is not enough for 2000 px photos
        if (ini_get('memory_limit') !== '-1') {
            ini_set('memory_limit', '1G');
        }

        $dryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');
        $limit = $this->option('limit') !== null ? (int) $this->option('limit') : null;

        $disk = Storage::disk('s3');

        $generated = 0;
        $skipped = 0;
        $failed = 0;

        Image::query()->orderBy('id')->chunkById(100, function ($images) use (
            $optimizer, $files, $disk, $dryRun, $force, $limit,
            &$generated, &$skipped, &$failed
        ) {
            foreach ($images as $image) {
                if ($limit !== null && $generated >= $limit) {
                    return false; // stop chunking
                }

                $missing = $this->missingRenditions($disk, $image->src, $force);

                if ($missing === []) {
                    $skipped++;

                    continue;
                }

                if ($dryRun) {
                    $this->line("Would generate: {$image->src} -> ".implode(', ', $missing));
                    $generated++;

                    continue;
                }

                try {
                    $this->generate($optimizer, $files, $disk, $image, $missing);
                    $generated++;
                } catch (\Throwable $e) {
                    $failed++;
                    $this->error("Failed: {$image->src} (image #{$image->id}) — {$e->getMessage()}");
                    Log::error('[images:generate-renditions] generation failed', [
                        'image_id' => $image->id,
                        'src' => $image->src,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return true;
        });

        $this->newLine();
        $this->info(($dryRun ? '[DRY RUN] ' : '')."Generated: {$generated}, skipped: {$skipped}, failed: {$failed}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Rendition paths that still have to be written, keyed by width
     *
     * @return array<int, string>
     */
    private function missingRenditions(Filesystem $disk, string $src, bool $force): array
    {
        $paths = ImageRenditions::paths($src);

        if ($force) {
            return $paths;
        }

        return array_filter($paths, fn (string $path) => ! $disk->exists($path));
    }

    /**
     * @param  array<int, string>  $missing  Rendition paths to write, keyed by width
     *
     * @throws \RuntimeException When the original is missing or cannot be decoded
     */
    private function generate(ImageOptimizer $optimizer, FileService $files, Filesystem $disk, Image $image, array $missing): void
    {
        $contents = $disk->get($image->src);

        if ($contents === null) {
            throw new \RuntimeException('original file is missing in storage');
        }

        // Printed BEFORE decoding: if the process is killed (OOM), the last line names the culprit
        $this->line("Generating: {$image->src} (image #{$image->id}) -> ".implode(', ', array_keys($missing)));

        $renditions = array_intersect_key($optimizer->renditions($contents), $missing);

        $files->putRenditions($image->src, $renditions);
    }
}
