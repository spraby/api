<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProductAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_made_to_order_variant_allows_optional_production_time(): void
    {
        Permission::findOrCreate(User::PERMISSIONS['WRITE_PRODUCTS']);

        $manager = User::factory()->create();
        $manager->givePermissionTo(User::PERMISSIONS['WRITE_PRODUCTS']);

        Brand::create([
            'user_id' => $manager->id,
            'name' => 'Test Brand',
        ]);

        $payload = [
            'title' => 'Made to order product',
            'description' => null,
            'enabled' => true,
            'category_id' => Category::factory()->create()->id,
            'variants' => [[
                'title' => null,
                'price' => 100,
                'final_price' => 100,
                'enabled' => true,
                'is_made_to_order' => true,
                'production_time_days' => null,
                'values' => [],
            ]],
        ];

        $this->actingAs($manager)
            ->post(route('admin.products.store'), $payload)
            ->assertSessionHasNoErrors();

        $product = Product::query()->where('title', $payload['title'])->firstOrFail();
        $variant = $product->variants()->firstOrFail();

        $this->assertTrue($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);

        $payload['variants'][0]['id'] = $variant->id;
        $payload['variants'][0]['production_time_days'] = 14;

        $this->actingAs($manager)
            ->put(route('admin.products.update', $product), $payload)
            ->assertSessionHasNoErrors();

        $variant->refresh();

        $this->assertTrue($variant->is_made_to_order);
        $this->assertSame(14, $variant->production_time_days);

        $payload['variants'][0]['is_made_to_order'] = false;

        $this->actingAs($manager)
            ->put(route('admin.products.update', $product), $payload)
            ->assertSessionHasNoErrors();

        $variant->refresh();

        $this->assertFalse($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);
    }
}
