<?php

namespace App\Console\Commands\Seeds;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Image;
use App\Models\Option;
use App\Models\OptionValue;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Variant;
use App\Models\VariantValue;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

class SeedProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:products {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for generate default values';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $force = !!$this->option('force');
        $this->generate($force);
    }

    /**
     * @param Brand $brand
     * @return void
     */
    public function generateImages(Brand $brand): void
    {
        $brand->images()->delete();

        $count = 32;
        $ids = [];
        while ($count > 0) {
            $image = Image::create([
                'src' => 'test/product-' . $count . '.png',
                'name' => 'product' . $count,
                'alt' => 'product' . $count,
            ]);

            $ids[] = $image->id;
            $count--;
        }

        $brand->images()->sync($ids);
    }


    /**
     * @return void
     */
    public function generate(): void
    {
        $brands = Brand::with('categories.options.values')->get();

        /**
         * @var Brand $brand
         */
        foreach ($brands as $brand) {
            $this->generateImages($brand);
            $this->info("Generating products for " . $brand->name);
            $brand->products()->delete();

            foreach ($brand->categories as $category) {
                $countProductsPerBrand = 10;
                $this->info("Generating products for " . $category->name . " category ({$countProductsPerBrand})");
                while ($countProductsPerBrand > 0) {
                    $product = $this->generateProduct($brand, $category);
                    $this->info("Product " . $product->id . " is created");
                    $countProductsPerBrand--;
                }
            }
        }
    }

    /**
     * @param Brand $brand
     * @param Category $category
     * @return Product
     * @throws \Random\RandomException
     */
    private function generateProduct(Brand $brand, Category $category): Product
    {
        $key = random_int(1, 10000000000);
        $price = random_int(10, 100);
        $final_price = $price * (random_int(90, 100) / 100);

        /**
         * @var Product $product
         */
        $product = Product::create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'title' => "Product {$category->name}-{$brand->id}-{$key}",
            'description' => "<div>
                        <p>Category: {$category->name}</p>
                        <p>Brand_id: {$brand->id}</p>
                        <p>Email: {$brand->user->email}</p>
                    </div>",
            'price' => $price,
            'final_price' => $final_price,
        ]);

        $count = $category->options->sum(function ($option) {
            return $option->values->count();
        });

        $variants = [];
        while ($count > 0) {
            $data = $this->generateVariantData($category->options, $variants);
            if ($data) $variants[] = $data;
            $count--;
        }

        $imageIds = $brand->images->random(count($variants))->pluck('id')->shuffle();
        $productImageIds = [];

        foreach ($imageIds as $key => $imageId) {
            $productImage = ProductImage::create([
                'image_id' => $imageId,
                'product_id' => $product->id,
                'position' => $key
            ]);
            $productImageIds[] = $productImage->id;
        }

        $variantLines = "";
        foreach ($variants as $key => $variantsData) {
            $variantPrice = $price * (random_int(90, 110) / 100);
            $title = implode('|', array_column($variantsData, 'value'));
            /**
             * @var Variant $variant
             */
            $variant = Variant::create([
                'image_id' => $productImageIds[$key],
                'product_id' => $product->id,
                'title' => $title,
                'price' => $variantPrice,
                'final_price' => $variantPrice * (random_int(90, 100) / 100),
            ]);

            foreach ($variantsData as $variantData) {
                VariantValue::create([
                    'variant_id' => $variant->id,
                    'option_id' => $variantData['option_id'],
                    'option_value_id' => $variantData['value_id']
                ]);
            }

            $variantLines .= "<p>Variant {$variant->id}: {$title}</p>";
        }

        $product->description = "<div>
            <p>Category: {$category->name}</p>
            <p>Brand_id: {$brand->id}</p>
            <p>Email: {$brand->user->email}</p>
            <p>VARIANTS:</p>
            {$variantLines}
        </div>";

        $product->save();

        return $product;
    }

    /**
     * @param Collection $options
     * @param array $variants
     * @param int $tries
     * @return array|null
     */
    private function generateVariantData(Collection $options, array $variants, int $tries = 10): ?array
    {
        $optionsData = $this->generateOptionsData($options);
        if (!$this->isExistsInArray($optionsData, $variants)) {
            return $optionsData;
        } else if ($tries > 0) {
            return $this->generateVariantData($options, $variants, --$tries);
        }
        return null;
    }

    /**
     * @param Collection $options
     * @return array
     */
    private function generateOptionsData(Collection $options): array
    {
        $variant = [];
        $options->each(static function (Option $option) use (&$variant) {
            if ($option->values->isEmpty()) {
                return;
            }

            /**
             * @var OptionValue $optionValue
             */
            $optionValue = $option->values->random();
            $variant[] = [
                'option_id' => $option->id,
                'value_id' => $optionValue->id,
                'value' => $optionValue->value,
            ];
        });
        return $variant;
    }

    /**
     * @param array $array1
     * @param array $array2
     * @return bool
     */
    private function compareVariantData(array $array1, array $array2): bool
    {
        return collect($array1)
                ->sortBy('option_id')
                ->values()
                ->all() === collect($array2)
                ->sortBy('option_id')
                ->values()
                ->all();
    }

    /**
     * @param array $item
     * @param array $items
     * @return bool
     */
    private function isExistsInArray(array $item, array $items): bool
    {
        foreach ($items as $i) {
            if ($this->compareVariantData($item, $i)) return true;
        }

        return false;
    }
}
