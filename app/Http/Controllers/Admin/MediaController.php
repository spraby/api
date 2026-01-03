<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\FileUploadDTO;
use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Image;
use App\Models\User;
use App\Services\FileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    /**
     * Display media gallery
     */
    public function index(): Response
    {
        /**
         * @var User $user
         */
        $user = auth()->user();

        $query = Image::query()
            ->with('brands:id,name');

        // Row Level Security: managers see only their brand's images
        if (! $user->hasRole('admin')) {
            $brand = $user->brands->first();
            if ($brand) {
                $query->whereHas('brands', function ($q) use ($brand) {
                    $q->where('brands.id', $brand->id);
                });
            }
        }

        $images = $query->latest()->paginate(50);

        return Inertia::render('Media', [
            'images' => $images,
        ]);
    }

    /**
     * Upload multiple images
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'images' => 'required|array|max:50',
            'images.*' => 'required|image|max:10240', // 10MB per image
        ]);

        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->brands->first();

        if (! $brand) {
            return redirect()->back()->withErrors(['error' => 'No brand associated with user']);
        }

        $dto = new FileUploadDTO(
            fileType: FileType::IMAGE,
            directory: "brands/{$brand->id}",
            visibility: 'public'
        );

        $paths = $this->fileService->uploadMultiple($validated['images'], $dto);

        foreach ($paths as $index => $path) {
            $originalName = $validated['images'][$index]->getClientOriginalName();

            Image::create([
                'name' => $originalName,
                'src' => $path,
            ]);
            // Note: Brand association is handled automatically in Image::created() event
        }

        return redirect()->back()->with('success', count($paths).' images uploaded successfully');
    }

    /**
     * Delete an image
     */
    public function destroy(Image $image): RedirectResponse
    {
        /**
         * @var User $user
         */
        $user = auth()->user();

        // Authorization: admins can delete any image, managers can only delete their brand's images
        if (! $user->hasRole('admin')) {
            $brand = $user->brands->first();
            if (! $brand || ! $image->brands->contains($brand->id)) {
                abort(403, 'Unauthorized to delete this image');
            }
        }

        $image->delete(); // Observer will automatically delete file from S3

        return redirect()->back()->with('success', 'Image deleted successfully');
    }
}
