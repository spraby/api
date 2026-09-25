<?php

namespace Tests\Feature\Admin;

use App\Models\Brand;
use App\Models\BrandRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * При одобрении заявки продавца тип аккаунта бренда определяется
 * по форме занятости: ИП/ЧУП/ООО — бизнес, остальное — мастер.
 */
class BrandRequestApprovalTypeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (User::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        Role::findOrCreate(User::ROLES['MANAGER']);
        Role::findOrCreate(User::ROLES['ADMIN'])->syncPermissions(array_values(User::PERMISSIONS));

        $this->admin = User::factory()->create();
        $this->admin->assignRole(User::ROLES['ADMIN']);
    }

    /**
     * @return array<string, array{0: ?string, 1: string}>
     */
    public static function employmentTypes(): array
    {
        return [
            'ООО' => ['llc', Brand::TYPE_BUSINESS],
            'ИП' => ['sole_proprietor', Brand::TYPE_BUSINESS],
            'ЧУП' => ['private_unitary_enterprise', Brand::TYPE_BUSINESS],
            'ремесленник' => ['craftsman', Brand::TYPE_MASTER],
            'самозанятый' => ['self_employed', Brand::TYPE_MASTER],
            'не указана' => [null, Brand::TYPE_MASTER],
        ];
    }

    #[DataProvider('employmentTypes')]
    public function test_approval_sets_account_type_from_employment_type(?string $employmentType, string $expectedType): void
    {
        $request = BrandRequest::create([
            'email' => 'seller@example.com',
            'brand_name' => 'Seller',
            'employment_type' => $employmentType,
            'status' => BrandRequest::STATUS_PENDING,
        ]);

        $this->actingAs($this->admin)
            ->post(route('admin.brand-requests.approve', $request))
            ->assertSessionHasNoErrors();

        $brand = Brand::query()->where('name', 'Seller')->firstOrFail();
        $this->assertSame($expectedType, $brand->type);
        $this->assertSame($employmentType, $brand->employment_type);
    }

    public function test_request_page_shows_account_type(): void
    {
        $request = BrandRequest::create([
            'email' => 'seller@example.com',
            'employment_type' => 'llc',
            'status' => BrandRequest::STATUS_PENDING,
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.brand-requests.show', $request))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('brandRequest.account_type', Brand::TYPE_BUSINESS)
            );
    }
}
