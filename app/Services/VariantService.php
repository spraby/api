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

        $existingVariantIds = $product->variants->pluck('id')->toArray();
        $submittedVariantIds = [];

        foreach ($variantsData as $variantData) {
            if (isset($variantData['id']) && in_array($variantData['id'], $existingVariantIds)) {
                // Update existing variant
                $variant = $product->variants->firstWhere('id', $variantData['id']);

                if ($variant) {
                    $variant->update($this->variantAttributes($variantData));
                    $submittedVariantIds[] = $variantData['id'];

                    $this->syncVariantValues($variant, $variantData['values'] ?? []);
                }
            } else {
                // Create new variant
                $variant = $product->variants()->create($this->variantAttributes($variantData));
                $submittedVariantIds[] = $variant->id;

                $this->createVariantValues($variant, $variantData['values'] ?? []);
            }
        }

        // Delete variants that were removed
        $variantsToDelete = array_diff($existingVariantIds, $submittedVariantIds);

        if (!empty($variantsToDelete)) {
            Variant::whereIn('id', $variantsToDelete)->delete();
        }
    }

    /**
     * Create variants for a new product (store flow).
     */
    public function createVariants(Product $product, array $variantsData): void
    {
        foreach ($variantsData as $variantData) {
            // Strip image_index (used by frontend for mapping, not a DB column)
            unset($variantData['image_index']);

            $variant = $product->variants()->create($this->variantAttributes($variantData));

            $this->createVariantValues($variant, $variantData['values'] ?? []);
        }
    }

    /**
     * Единая нормализация полей варианта для создания и обновления.
     *
     * Держим её в одном месте: раньше набор атрибутов дублировался в трёх
     * ветках, и любое новое поле легко было забыть в одной из них.
     */
    private function variantAttributes(array $variantData): array
    {
        $isMadeToOrder = (bool) ($variantData['is_made_to_order'] ?? false);

        return [
            'title' => $variantData['title'] ?? null,
            'price' => $variantData['price'],
            'final_price' => $variantData['final_price'],
            'enabled' => $variantData['enabled'],
            'image_id' => $variantData['image_id'] ?? null,
            'is_made_to_order' => $isMadeToOrder,
            'production_time_days' => $this->normalizeProductionTime($variantData, $isMadeToOrder),
        ];
    }

    /**
     * Срок изготовления хранится только у варианта «под заказ».
     *
     * Выключенный переключатель гасит срок на сервере, а не только в UI:
     * иначе в базе оставался бы висеть срок от прошлой настройки варианта.
     */
    private function normalizeProductionTime(array $variantData, bool $isMadeToOrder): ?int
    {
        if (! $isMadeToOrder) {
            return null;
        }

        $days = $variantData['production_time_days'] ?? null;

        if ($days === null || $days === '') {
            return null;
        }

        return (int) $days;
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
