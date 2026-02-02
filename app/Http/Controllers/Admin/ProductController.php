<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\FileUploadDTO;
use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductListResource;
use App\Models\Brand;
use App\Models\Image;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Variant;
use App\Services\FileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Show the products list page with products data.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Product::class);

        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return Inertia::render('Products', [
                'products' => [],
                'error' => 'No brand associated with user',
            ]);
        }

        $products = Product::with(['brand', 'category', 'images.image', 'variants'])
            ->where('brand_id', $brand->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Products', [
            'products' => ProductListResource::collection($products)->resolve(),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $this->authorize('create', Product::class);

        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return Inertia::render('ProductEdit', [
                'errors' => ['No brand associated with user']
            ]);
        }

        $brand->load('categories.options.values');

        $product = [
            'brand_id' => $brand->id,
            'category_id' => null,
            'title' => '',
            'description' => '',
            'enabled' => false,
            'brand' => $brand->toArray(),
            'variants' => [[
                'title' => '',
                'price' => 0,
                'final_price' => 0,
                'enabled' => false,
            ]],
        ];

        return Inertia::render('ProductCreate', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     * Data is fetched via API using TanStack Query
     */
    public function edit(Product $product): Response
    {
        $this->authorize('view', Product::class);

        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return Inertia::render('ProductEdit', [
                'errors' => ['No brand associated with user']
            ]);
        }

        // Verify product belongs to user's brand
        if ($product->brand_id !== $brand->id) {
            abort(403, 'Unauthorized');
        }

        $product->load([
            'brand.categories.options.values',
            'category.options.values' => function ($query) {
                $query->orderBy('position');
            },
            'images.image',
            'variants' => function ($query) {
                $query->orderBy('id');
            },
            'variants.image.image',
            'variants.values.value',
            'variants.values.option',
        ]);

        return Inertia::render('ProductEdit', [
            'product' => $product,
        ]);
    }

    /**
     * @param Product $product
     * @param UpdateProductRequest $request
     * @return RedirectResponse
     */
    public function update(Product $product, UpdateProductRequest $request): RedirectResponse
    {
        $this->authorize('update', Product::class);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            if (!$brand) {
                return Redirect::back()->with('error', 'Brand not found');
            }

            // Verify product belongs to user's brand
            if ($product->brand_id !== $brand->id) {
                abort(403, 'Unauthorized');
            }

            // Update product
            $product->update([
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'enabled' => $request->input('enabled'),
                'category_id' => $request->input('category_id'),
            ]);

            // Reload the product with variants
            $product->load('variants');

            // Get existing variant IDs
            $existingVariantIds = $product->variants->pluck('id')->toArray();
            $submittedVariantIds = [];

            // Update or create variants
            foreach ($request->input('variants') as $variantData) {
                if (isset($variantData['id']) && in_array($variantData['id'], $existingVariantIds)) {
                    // Update existing variant
                    $variant = $product->variants()->where('id', $variantData['id'])->first();

                    if ($variant) {
                        $variant->update([
                            'title' => $variantData['title'] ?? null,
                            'price' => $variantData['price'],
                            'final_price' => $variantData['final_price'],
                            'enabled' => $variantData['enabled'],
                        ]);
                        $submittedVariantIds[] = $variantData['id'];
                    }
                } else {

                    // Create new variant
                    $variant = Variant::create([
                        'product_id' => $product->id,
                        'title' => $variantData['title'] ?? null,
                        'price' => $variantData['price'],
                        'final_price' => $variantData['final_price'],
                        'enabled' => $variantData['enabled'],
                    ]);
                    $submittedVariantIds[] = $variant->id;
                }

                // Sync variant values
                if ($variant && isset($variantData['values']) && is_array($variantData['values'])) {
                    // Delete existing values
                    $variant->values()->delete();

                    // Create new values
                    foreach ($variantData['values'] as $valueData) {
                        $variant->values()->create([
                            'option_id' => $valueData['option_id'],
                            'option_value_id' => $valueData['option_value_id'],
                        ]);
                    }
                }
            }

            // Delete variants that were removed
            $variantsToDelete = array_diff($existingVariantIds, $submittedVariantIds);
            if (!empty($variantsToDelete)) {
                Variant::whereIn('id', $variantsToDelete)->delete();
            }

            $product->refresh()->load('variants');

            return Redirect::route('admin.products.edit', $product->id)
                ->with('success', 'Product updated successfully');

        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }
    }

    /**
     * @param StoreProductRequest $request
     * @return RedirectResponse
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            if (!$brand) {
                return Redirect::back()->with('error', 'Brand not found');
            }

            // Create product
            $product = Product::create([
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'enabled' => $request->input('enabled'),
                'category_id' => $request->input('category_id'),
                'brand_id' => $brand->id,
            ]);

            // Create variants
            foreach ($request->input('variants') as $variantData) {
                $variant = $product->variants()->create([
                    'title' => $variantData['title'] ?? null,
                    'price' => $variantData['price'],
                    'final_price' => $variantData['final_price'],
                    'enabled' => $variantData['enabled'],
                ]);

                // Create variant values
                if (isset($variantData['values']) && is_array($variantData['values'])) {
                    foreach ($variantData['values'] as $valueData) {
                        $variant->values()->create([
                            'option_id' => $valueData['option_id'],
                            'option_value_id' => $valueData['option_value_id'],
                        ]);
                    }
                }
            }

            return redirect()->route('admin.products.edit', $product->id)->with('success', 'Product created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    /**
     * Delete a product (Inertia).
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', Product::class);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            // Verify product belongs to user's brand
            if ($brand && $product->brand_id !== $brand->id) {
                abort(403, 'Unauthorized');
            }

            $product->delete();

            return Redirect::route('admin.products')->with('success', 'Product deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete product: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete products (Inertia).
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Product::class);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
        ]);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            $productIds = $request->input('product_ids');

            // Only delete products belonging to user's brand
            if ($brand) {
                Product::whereIn('id', $productIds)
                    ->where('brand_id', $brand->id)
                    ->delete();
            }

            return Redirect::route('admin.products')->with('success', 'Products deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete products: ' . $e->getMessage());
        }
    }

    /**
     * Bulk update product status (Inertia).
     */
    public function bulkUpdateStatus(Request $request): RedirectResponse
    {
        $this->authorize('update', Product::class);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
            'enabled' => 'required|boolean',
        ]);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            $productIds = $request->input('product_ids');
            $enabled = $request->input('enabled');

            // Only update products belonging to user's brand
            if ($brand) {
                Product::whereIn('id', $productIds)
                    ->where('brand_id', $brand->id)
                    ->update(['enabled' => $enabled]);
            }

            return Redirect::route('admin.products')->with('success', 'Product status updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update product status: ' . $e->getMessage());
        }
    }

    // ========================================
    // INERTIA PRODUCT IMAGES METHODS
    // ========================================

    /**
     * Inertia: Attach images to product
     */
    public function attachImages(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', Product::class);

        $request->validate([
            'image_ids' => 'required|array|min:1',
            'image_ids.*' => 'required|integer|exists:images,id',
        ]);

        try {
            $imageIds = $request->input('image_ids');

            // Get current max position
            $maxPosition = $product->images()->max('position') ?? 0;

            foreach ($imageIds as $imageId) {
                // Check if image already attached
                $exists = $product->images()->where('image_id', $imageId)->exists();
                if (!$exists) {
                    $product->images()->create([
                        'image_id' => $imageId,
                        'position' => ++$maxPosition,
                    ]);
                }
            }

            return Redirect::back()->with('success', 'Images attached successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to attach images: ' . $e->getMessage());
        }
    }

    /**
     * Inertia: Upload new images and attach to product
     */
    public function uploadImages(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', Product::class);

        $request->validate([
            'images' => 'required|array|min:1|max:50',
            'images.*' => 'required|image|max:10240', // 10MB per image
        ]);

        try {

            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            if (!$brand) {
                return Redirect::back()->with('error', 'No brand associated with user');
            }

            $fileService = app(FileService::class);

            $dto = new FileUploadDTO(
                fileType: FileType::IMAGE,
                directory: "brands/{$brand->id}",
                visibility: 'public'
            );

            $paths = $fileService->uploadMultiple($request->file('images'), $dto);

            // Get current max position
            $maxPosition = $product->images()->max('position') ?? 0;

            foreach ($paths as $index => $path) {
                $originalName = $request->file('images')[$index]->getClientOriginalName();

                $image = Image::create([
                    'name' => $originalName,
                    'src' => $path,
                    'brand_id' => $brand->id,
                ]);

                $product->images()->create([
                    'image_id' => $image->id,
                    'position' => ++$maxPosition,
                ]);
            }

            return Redirect::back()->with('success', 'Images uploaded successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to upload images: ' . $e->getMessage());
        }
    }

    /**
     * Inertia: Detach image from product
     */
    public function detachImage(Product $product, int $productImageId): RedirectResponse
    {
        $this->authorize('update', Product::class);

        try {
            $productImage = ProductImage::where('id', $productImageId)
                ->where('product_id', $product->id)
                ->firstOrFail();

            $productImage->delete();

            return Redirect::back()->with('success', 'Image removed successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to remove image: ' . $e->getMessage());
        }
    }

    /**
     * Inertia: Reorder product images
     */
    public function reorderImages(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', Product::class);

        $request->validate([
            'image_ids' => 'required|array|min:1',
            'image_ids.*' => 'required|integer|exists:product_images,id',
        ]);

        try {
            $imageIds = $request->input('image_ids');

            foreach ($imageIds as $position => $imageId) {
                ProductImage::where('id', $imageId)
                    ->where('product_id', $product->id)
                    ->update(['position' => $position + 1]);
            }

            return Redirect::back()->with('success', 'Images reordered successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to reorder images: ' . $e->getMessage());
        }
    }
}
