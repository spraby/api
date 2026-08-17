<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Services\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MigrateImagesToWebpCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'images:migrate-webp
        {--dry-run : Only report what would be converted, without changing anything}
        {--keep-original : Do not delete the original file from storage after conversion}
        {--limit= : Max images to convert in this run}';

    /**
     * @var string
     */
    protected $description = 'Convert existing product/media images in storage to downscaled WebP and update their src';

    /**
     * Extensions the optimizer can convert. GIF (animation) and SVG (vector) are skipped.
     *
     * @var array<string>
     */
    private const CONVERTIBLE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

    public function handle(ImageOptimizer $optimizer): int
    {
        // GD holds the full uncompressed bitmap in memory; the default 128M
        // limit is not enough for large photos
        if (ini_get('memory_limit') !== '-1') {
            ini_set('memory_limit', '1G');
        }

        $dryRun = (bool) $this->option('dry-run');
        $keepOriginal = (bool) $this->option('keep-original');
        $limit = $this->option('limit') !== null ? (int) $this->option('limit') : null;

        $disk = Storage::disk('s3');

        $converted = 0;
        $skipped = 0;
        $failed = 0;
        $bytesBefore = 0;
        $bytesAfter = 0;

        Image::query()->orderBy('id')->chunkById(100, function ($images) use (
            $optimizer, $disk, $dryRun, $keepOriginal, $limit,
            &$converted, &$skipped, &$failed, &$bytesBefore, &$bytesAfter
        ) {
            foreach ($images as $image) {
                if ($limit !== null && $converted >= $limit) {
                    return false; // stop chunking
                }

                $extension = strtolower(pathinfo($image->src, PATHINFO_EXTENSION));

                if (! in_array($extension, self::CONVERTIBLE_EXTENSIONS, true)) {
                    $skipped++;
                    continue;
                }

                $newPath = $this->webpPath($image->src);

                try {
                    $contents = $disk->get($image->src);

                    if ($contents === null) {
                        $this->warn("Missing file, skipped: {$image->src} (image #{$image->id})");
                        $failed++;
                        continue;
                    }

                    if ($dryRun) {
                        $this->line("Would convert: {$image->src} -> {$newPath}");
                        $converted++;
                        continue;
                    }

                    // Printed BEFORE decoding: if the process is killed
                    // (OOM/segfault), the last line names the culprit file
                    $this->line("Converting: {$image->src} (image #{$image->id})");

                    $optimized = $optimizer->optimizeBinary($contents);
                    $oldPath = $image->src;

                    $disk->put($newPath, $optimized);
                    $disk->setVisibility($newPath, 'public');

                    // updateQuietly: src change must not trigger model events
                    $image->updateQuietly(['src' => $newPath]);

                    if (! $keepOriginal && $oldPath !== $newPath) {
                        $disk->delete($oldPath);
                    }

                    $bytesBefore += strlen($contents);
                    $bytesAfter += strlen($optimized);
                    $converted++;

                    $this->line(sprintf(
                        '  -> %s (%s -> %s)',
                        $newPath,
                        $this->formatBytes(strlen($contents)),
                        $this->formatBytes(strlen($optimized)),
                    ));

                    unset($contents, $optimized);
                } catch (\Throwable $e) {
                    $failed++;
                    $this->error("Failed: {$image->src} (image #{$image->id}) — {$e->getMessage()}");
                    Log::error('[images:migrate-webp] conversion failed', [
                        'image_id' => $image->id,
                        'src' => $image->src,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return true;
        });

        $this->newLine();
        $this->info(($dryRun ? '[DRY RUN] ' : '')."Converted: {$converted}, skipped: {$skipped}, failed: {$failed}");

        if (! $dryRun && $bytesBefore > 0) {
            $savedPercent = round((1 - $bytesAfter / $bytesBefore) * 100, 1);
            $this->info(sprintf(
                'Size: %s -> %s (saved %s%%)',
                $this->formatBytes($bytesBefore),
                $this->formatBytes($bytesAfter),
                $savedPercent,
            ));
        }

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function webpPath(string $src): string
    {
        $directory = pathinfo($src, PATHINFO_DIRNAME);
        $basename = pathinfo($src, PATHINFO_FILENAME);

        $path = "{$basename}.".ImageOptimizer::OUTPUT_EXTENSION;

        return in_array($directory, ['', '.'], true) ? $path : "{$directory}/{$path}";
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 1).' MB';
    }
}
