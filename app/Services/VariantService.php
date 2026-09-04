<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Variant;

class VariantService
{
    /**
     * Sync variants for an existing product (update flow).
     * Creates new, updates existing, deletes removed variants.
     * Smart sync: skips variant_values re-sync when unchanged.
     */
    public function syncVariants(Product $product, array $variantsData): void
    {
        $product->load('variants.values');

        $existingVariants = $product->variants->keyBy('id');
        $submittedVariantIds = [];

        foreach ($variantsData as $variantData) {
            $variantId = isset($variantData['id']) ? (int) $variantData['id'] : null;
            $variant = $variantId ? $existingVariants->get($variantId) : null;

            if ($variant) {
                // Update existing variant
                $variant->update($this->variantAttributes($variantData));
                $submittedVariantIds[] = $variant->id;

                $this->syncVariantValues($variant, $variantData['values'] ?? []);
            } else {
                // Create new variant
                $variant = $product->variants()->create($this->variantAttributes($variantData));
                $submittedVariantIds[] = $variant->id;

                $this->createVariantValues($variant, $variantData['values'] ?? []);
            }
        }

        // Delete variants that were removed
        $variantsToDelete = $existingVariants->keys()->diff($submittedVariantIds);

        if ($variantsToDelete->isNotEmpty()) {
            Variant::whereIn('id', $variantsToDelete->all())->delete();
        }
    }

    /**
     * Create variants for a new product (store flow).
     */
    public function createVariants(Product $product, array $variantsData): void
    {
        foreach ($variantsData as $variantData) {
            $variant = $product->variants()->create($this->variantAttributes($variantData));

            $this->createVariantValues($variant, $variantData['values'] ?? []);
        }
    }

    /**
     * Build the persisted variant fields and keep availability data consistent.
     */
    private function variantAttributes(array $variantData): array
    {
        $isMadeToOrder = (bool) ($variantData['is_made_to_order'] ?? false);
        $productionTimeDays = $variantData['production_time_days'] ?? null;

        return [
            'title' => $variantData['title'] ?? null,
            'price' => $variantData['price'],
            'final_price' => $variantData['final_price'],
            'enabled' => $variantData['enabled'],
            'is_made_to_order' => $isMadeToOrder,
            'production_time_days' => $isMadeToOrder && $productionTimeDays !== null
                ? (int) $productionTimeDays
                : null,
            'image_id' => $variantData['image_id'] ?? null,
        ];
    }

    /**
     * Smart sync variant values: compare before delete+recreate.
     */
    private function syncVariantValues(Variant $variant, array $newValues): void
    {
        if (empty($newValues)) {
            $variant->values()->delete();

            return;
        }

        $existingValues = $variant->values->map(fn ($v) => [
            'option_id' => $v->option_id,
            'option_value_id' => $v->option_value_id,
        ])->sortBy(['option_id', 'option_value_id'])->values()->toArray();

        $submittedValues = collect($newValues)->map(fn ($v) => [
            'option_id' => $v['option_id'],
            'option_value_id' => $v['option_value_id'],
        ])->sortBy(['option_id', 'option_value_id'])->values()->toArray();

        // Skip if values unchanged
        if ($existingValues === $submittedValues) {
            return;
        }

        $variant->values()->delete();
        $this->createVariantValues($variant, $newValues);
    }

    /**
     * Bulk create variant values using createMany.
     */
    private function createVariantValues(Variant $variant, array $values): void
    {
        if (empty($values)) {
            return;
        }

        $variant->values()->createMany(
            array_map(fn ($v) => [
                'option_id' => $v['option_id'],
                'option_value_id' => $v['option_value_id'],
            ], $values)
        );
    }
}
