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
            } else {
                // Allow removing image
                $variant->image_id = null;
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
            } else {
                // Allow removing image
                $variant->image_id = null;
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
