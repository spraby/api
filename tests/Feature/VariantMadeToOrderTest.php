<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VariantMadeToOrderTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;

    private Brand $brand;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate('manager')->syncPermissions(User::MANAGER_PERMISSIONS);

        $this->manager = User::factory()->create();
        $this->manager->assignRole('manager');
        $this->brand = Brand::create(['user_id' => $this->manager->id, 'name' => 'Test Brand']);
        $this->category = Category::factory()->create();
    }

    /**
     * @param  array<string, mixed>  $variantOverrides
     * @return array<string, mixed>
     */
    private function productPayload(array $variantOverrides = []): array
    {
        return [
            'title' => 'Мёд гречишный',
            'description' => null,
            'enabled' => true,
            'category_id' => $this->category->id,
            'variants' => [
                array_merge([
                    'title' => '',
                    'price' => 100,
                    'final_price' => 90,
                    'enabled' => true,
                    'is_made_to_order' => false,
                    'production_time_days' => null,
                    'values' => [],
                ], $variantOverrides),
            ],
        ];
    }

    private function createProductWithVariant(array $variantOverrides = []): Variant
    {
        $this->actingAs($this->manager)
            ->post(route('admin.products.store'), $this->productPayload($variantOverrides))
            ->assertSessionHasNoErrors();

        $variant = Product::query()->latest('id')->firstOrFail()->variants()->firstOrFail();

        return $variant;
    }

    public function test_creates_made_to_order_variant_without_production_time(): void
    {
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => true,
            'production_time_days' => null,
        ]);

        $this->assertTrue($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);
    }

    public function test_creates_made_to_order_variant_with_production_time(): void
    {
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => true,
            'production_time_days' => 14,
        ]);

        $this->assertTrue($variant->is_made_to_order);
        $this->assertSame(14, $variant->production_time_days);
    }

    public function test_regular_variant_never_stores_production_time(): void
    {
        // Срок пришёл при выключенном статусе — сервер обязан его погасить.
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => false,
            'production_time_days' => 30,
        ]);

        $this->assertFalse($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);
    }

    public function test_update_sets_production_time(): void
    {
        $variant = $this->createProductWithVariant();
        $product = $variant->product;

        $this->actingAs($this->manager)
            ->put(route('admin.products.update', $product->id), $this->productPayload([
                'id' => $variant->id,
                'is_made_to_order' => true,
                'production_time_days' => 7,
            ]))
            ->assertSessionHasNoErrors();

        $variant->refresh();
        $this->assertTrue($variant->is_made_to_order);
        $this->assertSame(7, $variant->production_time_days);
    }

    public function test_turning_status_off_clears_production_time(): void
    {
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => true,
            'production_time_days' => 21,
        ]);
        $product = $variant->product;

        $this->actingAs($this->manager)
            ->put(route('admin.products.update', $product->id), $this->productPayload([
                'id' => $variant->id,
                'is_made_to_order' => false,
                'production_time_days' => 21,
            ]))
            ->assertSessionHasNoErrors();

        $variant->refresh();
        $this->assertFalse($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);
    }

    public function test_clearing_only_production_time_keeps_status(): void
    {
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => true,
            'production_time_days' => 21,
        ]);
        $product = $variant->product;

        $this->actingAs($this->manager)
            ->put(route('admin.products.update', $product->id), $this->productPayload([
                'id' => $variant->id,
                'is_made_to_order' => true,
                'production_time_days' => null,
            ]))
            ->assertSessionHasNoErrors();

        $variant->refresh();
        $this->assertTrue($variant->is_made_to_order);
        $this->assertNull($variant->production_time_days);
    }

    public static function invalidProductionTimeProvider(): array
    {
        return [
            'меньше минимума' => [0],
            'отрицательный' => [-5],
            'больше максимума' => [366],
            'не целое' => [2.5],
        ];
    }

    #[DataProvider('invalidProductionTimeProvider')]
    public function test_invalid_production_time_is_rejected(mixed $days): void
    {
        $this->actingAs($this->manager)
            ->post(route('admin.products.store'), $this->productPayload([
                'is_made_to_order' => true,
                'production_time_days' => $days,
            ]))
            ->assertSessionHasErrors('variants.0.production_time_days');

        $this->assertSame(0, Variant::query()->count());
    }

    public function test_boundary_production_time_is_accepted(): void
    {
        foreach ([1, 365] as $days) {
            $variant = $this->createProductWithVariant([
                'is_made_to_order' => true,
                'production_time_days' => $days,
            ]);

            $this->assertSame($days, $variant->production_time_days);
        }
    }

    public function test_is_made_to_order_is_required(): void
    {
        $payload = $this->productPayload();
        unset($payload['variants'][0]['is_made_to_order']);

        $this->actingAs($this->manager)
            ->post(route('admin.products.store'), $payload)
            ->assertSessionHasErrors('variants.0.is_made_to_order');
    }

    public function test_resource_exposes_new_fields(): void
    {
        $variant = $this->createProductWithVariant([
            'is_made_to_order' => true,
            'production_time_days' => 5,
        ]);

        $this->actingAs($this->manager)
            ->get(route('admin.products.edit', $variant->product_id))
            ->assertInertia(fn ($page) => $page
                ->where('product.variants.0.is_made_to_order', true)
                ->where('product.variants.0.production_time_days', 5));
    }
}
