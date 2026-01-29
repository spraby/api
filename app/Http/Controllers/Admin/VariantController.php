<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductImage;
use App\Models\Variant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class VariantController extends Controller
{
    private function shouldEnableVariant(Variant $variant): bool
    {
        $variant->loadMissing(['values', 'product.category.options.values']);

        $hasTitle = trim((string) $variant->title) !== '';
        $hasPrice = (float) $variant->price > 0;
        $hasFinalPrice = (float) $variant->final_price > 0;
        $hasImage = ! is_null($variant->image_id);

        if (! $hasTitle || ! $hasPrice || ! $hasFinalPrice || ! $hasImage) {
            return false;
        }

        $options = $variant->product?->category?->options ?? collect();
        $optionsWithValues = $options->filter(fn ($option) => $option->values && $option->values->count() > 0);

        foreach ($optionsWithValues as $option) {
            $hasValue = $variant->values->contains(fn ($value) => $value->option_id === $option->id && $value->option_value_id);
            if (! $hasValue) {
                return false;
            }
        }

        return true;
    }

    /**
     * Inertia: Set image for variant
     */
    public function setImage(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'product_image_id' => 'nullable|integer|exists:product_images,id',
        ]);

        try {
            $variant = Variant::findOrFail($id);
            $productImageId = $request->input('product_image_id');

            // If product_image_id is provided, verify it belongs to the same product
            if ($productImageId) {
                $productImage = ProductImage::where('id', $productImageId)
                    ->where('product_id', $variant->product_id)
                    ->firstOrFail();

                $variant->image_id = $productImage->id;
                $variant->enabled = $this->shouldEnableVariant($variant);
            } else {
                // Allow removing image
                $variant->image_id = null;
                $variant->enabled = false;
            }

            $variant->save();

            return Redirect::back()->with('success', 'Variant image updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update variant image: ' . $e->getMessage());
        }
    }

    /**
     * API: Set image for variant
     */
    public function apiSetImage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'product_image_id' => 'nullable|integer|exists:product_images,id',
        ]);

        try {
            $variant = Variant::findOrFail($id);
            $productImageId = $request->input('product_image_id');

            // If product_image_id is provided, verify it belongs to the same product
            if ($productImageId) {
                $productImage = ProductImage::where('id', $productImageId)
                    ->where('product_id', $variant->product_id)
                    ->firstOrFail();

                $variant->image_id = $productImage->id;
                $variant->enabled = $this->shouldEnableVariant($variant);
            } else {
                // Allow removing image
                $variant->image_id = null;
                $variant->enabled = false;
            }

            $variant->save();

            // Reload variant with image
            $variant->load('image.image');

            return response()->json([
                'message' => 'Variant image updated successfully',
                'variant' => [
                    'id' => $variant->id,
                    'title' => $variant->title,
                    'price' => (string) $variant->price,
                    'final_price' => (string) $variant->final_price,
                    'enabled' => $variant->enabled,
                    'image_id' => $variant->image_id,
                    'image_url' => $variant->image?->image?->url,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to set variant image',
                'errors' => ['general' => [$e->getMessage()]],
            ], 422);
        }
    }
}
