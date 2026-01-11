<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\FileUploadDTO;
use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Image;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Variant;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Show the products list page.
     * Data is fetched via API using TanStack Query
     */
    public function index(): Response
    {
        return Inertia::render('Products', []);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
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
                'price' => $request->input('price') ?: 0,
                'final_price' => $request->input('final_price') ?: 0,
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

            return Redirect::route('sb.admin.products.edit', $product->id)
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
                'price' => $request->input('price') ?: 0,
                'final_price' => $request->input('final_price') ?: 0,
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

            return redirect()->route('sb.admin.products.edit', $product->id)->with('success', 'Product created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    // ========================================
    // API ENDPOINTS (для TanStack Query)
    // ========================================

    /**
     * API: Get all products as JSON
     */
    public function apiIndex(Request $request): JsonResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return response()->json([
                'message' => 'No brand associated with user',
            ], 403);
        }

        $query = Product::with(['brand', 'category', 'images.image'])
            ->where('brand_id', $brand->id)
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $categoryId = $request->input('category_id');
            $query->where('category_id', $categoryId);
        }

        if ($request->has('enabled')) {
            $enabled = $request->input('enabled');
            if ($enabled === 'true' || $enabled === '1') {
                $query->where('enabled', true);
            } elseif ($enabled === 'false' || $enabled === '0') {
                $query->where('enabled', false);
            }
        }

        $products = $query->get()->map(function ($product) {
            $mainImage = $product->images->sortBy('position')->first();

            return [
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => (string)$product->price,
                'final_price' => (string)$product->final_price,
                'enabled' => $product->enabled,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'image_url' => $mainImage?->image?->url,
                'created_at' => $product->created_at->toISOString(),
            ];
        });

        return response()->json($products);
    }

    /**
     * API: Get single product as JSON
     */
    public function apiShow(int $id): JsonResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand) {
            return response()->json([
                'message' => 'No brand associated with user',
            ], 403);
        }

        $product = Product::with([
            'brand',
            'category.options.values' => function ($query) {
                $query->orderBy('position');
            },
            'images.image',
            'variants.values.value',
            'variants.values.option',
        ])
            ->where('brand_id', $brand->id)
            ->findOrFail($id);
        $mainImage = $product->images->sortBy('position')->first();

        return response()->json([
            'id' => $product->id,
            'title' => $product->title,
            'description' => $product->description,
            'price' => (string)$product->price,
            'final_price' => (string)$product->final_price,
            'enabled' => $product->enabled,
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
            ] : null,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'options' => $product->category->options,
            ] : null,
            'image_url' => $mainImage?->image?->url,
            'images' => $product->images->sortBy('position')->map(function ($productImage) {
                return [
                    'id' => $productImage->id,
                    'image_id' => $productImage->image_id,
                    'url' => $productImage->image?->url,
                    'position' => $productImage->position,
                ];
            })->values(),
            'variants' => $product->variants->sortBy('id')->map(function (Variant $variant) {
                return [
                    'id' => $variant->id,
                    'title' => $variant->title,
                    'price' => (string)$variant->price,
                    'final_price' => (string)$variant->final_price,
                    'discount' => (string)$variant->discount,
                    'enabled' => $variant->enabled,
                    'image_id' => $variant->image_id,
                    'image_url' => $variant->image?->image?->url,
                    'values' => $variant->values->map(function ($variantValue) {
                        return [
                            'id' => $variantValue->id,
                            'variant_id' => $variantValue->variant_id,
                            'option_id' => $variantValue->option_id,
                            'option_value_id' => $variantValue->option_value_id,
                            'option' => $variantValue->option ? [
                                'id' => $variantValue->option->id,
                                'name' => $variantValue->option->name,
                                'title' => $variantValue->option->title,
                            ] : null,
                            'value' => $variantValue->value ? [
                                'id' => $variantValue->value->id,
                                'value' => $variantValue->value->value,
                            ] : null,
                        ];
                    })->values(),
                ];
            })->values(),
            'created_at' => $product->created_at->toISOString(),
        ]);
    }

    /**
     * API: Create new product and return JSON
     */
    public function apiStore(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'final_price' => 'nullable|numeric|min:0',
            'enabled' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.title' => 'nullable|string|max:255',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.final_price' => 'required|numeric|min:0',
            'variants.*.enabled' => 'required|boolean',
            'variants.*.values' => 'nullable|array',
            'variants.*.values.*.option_id' => 'required|exists:options,id',
            'variants.*.values.*.option_value_id' => 'required|exists:option_values,id',
        ]);

        try {
            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->getBrand();

            if (!$brand) {
                return response()->json([
                    'message' => 'No brand associated with user',
                ], 403);
            }

            // Create product (brand_id will be set automatically via observer)
            $product = Product::create([
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'price' => $request->input('price') ?: 0,
                'final_price' => $request->input('final_price') ?: 0,
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

            // Load relationships
            $product->load([
                'brand',
                'category.options.values',
                'images.image',
                'variants.values.value',
                'variants.values.option',
            ]);

            $mainImage = $product->images->sortBy('position')->first();

            return response()->json([
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => (string)$product->price,
                'final_price' => (string)$product->final_price,
                'enabled' => $product->enabled,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'image_url' => $mainImage?->image?->url,
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
                'variants' => $product->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'title' => $variant->title,
                        'price' => (string)$variant->price,
                        'final_price' => (string)$variant->final_price,
                        'enabled' => $variant->enabled,
                        'image_id' => $variant->image_id,
                        'image_url' => $variant->image?->image?->url,
                        'values' => $variant->values->map(function ($variantValue) {
                            return [
                                'id' => $variantValue->id,
                                'variant_id' => $variantValue->variant_id,
                                'option_id' => $variantValue->option_id,
                                'option_value_id' => $variantValue->option_value_id,
                                'option' => $variantValue->option ? [
                                    'id' => $variantValue->option->id,
                                    'name' => $variantValue->option->name,
                                    'title' => $variantValue->option->title,
                                ] : null,
                                'value' => $variantValue->value ? [
                                    'id' => $variantValue->value->id,
                                    'value' => $variantValue->value->value,
                                ] : null,
                            ];
                        })->values(),
                    ];
                }),
                'created_at' => $product->created_at->toISOString(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create product',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Update product and return JSON
     */
    public function apiUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'final_price' => 'nullable|numeric|min:0',
            'enabled' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.title' => 'nullable|string|max:255',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.final_price' => 'required|numeric|min:0',
            'variants.*.enabled' => 'required|boolean',
            'variants.*.values' => 'nullable|array',
            'variants.*.values.*.option_id' => 'required|exists:options,id',
            'variants.*.values.*.option_value_id' => 'required|exists:option_values,id',
        ]);

        try {
            $product = Product::findOrFail($id);

            // Update product
            $product->update([
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'price' => $request->input('price') ?: 0,
                'final_price' => $request->input('final_price') ?: 0,
                'enabled' => $request->input('enabled'),
                'category_id' => $request->input('category_id'),
            ]);

            // Get existing variant IDs
            $existingVariantIds = $product->variants->pluck('id')->toArray();
            $submittedVariantIds = [];

            // Update or create variants
            foreach ($request->input('variants') as $variantData) {
                if (isset($variantData['id']) && in_array($variantData['id'], $existingVariantIds)) {
                    // Update existing variant
                    $variant = Variant::find($variantData['id']);
                    $variant->update([
                        'title' => $variantData['title'] ?? null,
                        'price' => $variantData['price'],
                        'final_price' => $variantData['final_price'],
                        'enabled' => $variantData['enabled'],
                    ]);
                    $submittedVariantIds[] = $variantData['id'];
                } else {
                    // Create new variant
                    $variant = $product->variants()->create([
                        'title' => $variantData['title'] ?? null,
                        'price' => $variantData['price'],
                        'final_price' => $variantData['final_price'],
                        'enabled' => $variantData['enabled'],
                    ]);
                    $submittedVariantIds[] = $variant->id;
                }

                // Sync variant values
                if (isset($variantData['values']) && is_array($variantData['values'])) {
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

            // Reload product with relationships
            $product->load([
                'brand',
                'category.options.values',
                'images.image',
                'variants.values.value',
                'variants.values.option',
            ]);

            $mainImage = $product->images->sortBy('position')->first();

            return response()->json([
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => (string)$product->price,
                'final_price' => (string)$product->final_price,
                'enabled' => $product->enabled,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'image_url' => $mainImage?->image?->url,
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
                'variants' => $product->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'title' => $variant->title,
                        'price' => (string)$variant->price,
                        'final_price' => (string)$variant->final_price,
                        'enabled' => $variant->enabled,
                        'image_id' => $variant->image_id,
                        'image_url' => $variant->image?->image?->url,
                        'values' => $variant->values->map(function ($variantValue) {
                            return [
                                'id' => $variantValue->id,
                                'variant_id' => $variantValue->variant_id,
                                'option_id' => $variantValue->option_id,
                                'option_value_id' => $variantValue->option_value_id,
                                'option' => $variantValue->option ? [
                                    'id' => $variantValue->option->id,
                                    'name' => $variantValue->option->name,
                                    'title' => $variantValue->option->title,
                                ] : null,
                                'value' => $variantValue->value ? [
                                    'id' => $variantValue->value->id,
                                    'value' => $variantValue->value->value,
                                ] : null,
                            ];
                        })->values(),
                    ];
                }),
                'created_at' => $product->created_at->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Delete product and return JSON
     */
    public function apiDestroy(int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Bulk delete products and return JSON
     */
    public function apiBulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
        ]);

        $productIds = $request->input('product_ids');

        Product::whereIn('id', $productIds)->delete();

        return response()->json([
            'message' => 'Products deleted successfully',
        ]);
    }

    /**
     * API: Bulk update product status (enabled/disabled)
     */
    public function apiBulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
            'enabled' => 'required|boolean',
        ]);

        $productIds = $request->input('product_ids');
        $enabled = $request->input('enabled');

        Product::whereIn('id', $productIds)->update(['enabled' => $enabled]);

        return response()->json([
            'message' => 'Product status updated successfully',
        ]);
    }

    // ========================================
    // PRODUCT IMAGES API
    // ========================================

    /**
     * API: Attach existing images from media library to product
     */
    public function apiAttachImages(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image_ids' => 'required|array|min:1',
            'image_ids.*' => 'required|integer|exists:images,id',
        ]);

        try {
            $product = Product::findOrFail($id);
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

            // Reload product with images
            $product->load('images.image');

            return response()->json([
                'message' => 'Images attached successfully',
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to attach images',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Upload new images and attach to product
     */
    public function apiUploadImages(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|min:1|max:50',
            'images.*' => 'required|image|max:10240', // 10MB per image
        ]);

        try {
            $product = Product::findOrFail($id);

            /**
             * @var User $user
             * @var Brand $brand
             */
            $user = auth()->user();
            $brand = $user->brands->first();

            if (!$brand) {
                return response()->json([
                    'message' => 'No brand associated with user',
                ], 403);
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
                ]);

                $product->images()->create([
                    'image_id' => $image->id,
                    'position' => ++$maxPosition,
                ]);
            }

            // Reload product with images
            $product->load('images.image');

            return response()->json([
                'message' => 'Images uploaded successfully',
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload images',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Detach image from product
     */
    public function apiDetachImage(int $id, int $productImageId): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $productImage = ProductImage::where('id', $productImageId)
                ->where('product_id', $id)
                ->firstOrFail();

            $productImage->delete();

            // Reload product with images
            $product->load('images.image');

            return response()->json([
                'message' => 'Image detached successfully',
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to detach image',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * API: Reorder product images
     */
    public function apiReorderImages(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image_ids' => 'required|array|min:1',
            'image_ids.*' => 'required|integer|exists:product_images,id',
        ]);

        try {
            $product = Product::findOrFail($id);
            $imageIds = $request->input('image_ids');

            foreach ($imageIds as $position => $imageId) {
                ProductImage::where('id', $imageId)
                    ->where('product_id', $id)
                    ->update(['position' => $position + 1]);
            }

            // Reload product with images
            $product->load('images.image');

            return response()->json([
                'message' => 'Images reordered successfully',
                'images' => $product->images->sortBy('position')->map(function ($productImage) {
                    return [
                        'id' => $productImage->id,
                        'image_id' => $productImage->image_id,
                        'url' => $productImage->image?->url,
                        'position' => $productImage->position,
                    ];
                })->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reorder images',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
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
