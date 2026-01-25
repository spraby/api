<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property string $id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string $email
 * @property string|null $phone
 * @property string $password
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Collection<Brand> $brands
 *
 * @method static Builder|static email(string $email)
 * @method static Builder|static admin()
 * @method static Builder|static manager()
 * @method static Builder|static query()
 * @method void assignRole(string|array $roles)
 * @method bool hasRole(string $role)
 *
 * @mixin Builder
 */
class User extends Authenticatable
{
    use HasFactory;
    use HasRoles;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'role' => 'string',
    ];

    public const ROLES = [
        'ADMIN' => 'admin',
        'MANAGER' => 'manager',
    ];

    /**
     * @var array
     */
    public const PERMISSIONS = [
        'READ_PRODUCTS' => 'read_products',
        'WRITE_PRODUCTS' => 'write_products',
        'READ_PRODUCT_VARIANTS' => 'read_product_variants',
        'WRITE_PRODUCT_VARIANTS' => 'write_product_variants',
        'READ_CATEGORIES' => 'read_categories',
        'WRITE_CATEGORIES' => 'write_categories',
        'READ_COLLECTIONS' => 'read_collections',
        'WRITE_COLLECTIONS' => 'write_collections',
        'READ_BRANDS' => 'read_brands',
        'WRITE_BRANDS' => 'write_brands',
        'READ_USERS' => 'read_users',
        'WRITE_USERS' => 'write_users',
        'READ_OPTIONS' => 'read_options',
        'WRITE_OPTIONS' => 'write_options',
        'READ_OPTION_VALUES' => 'read_option_values',
        'WRITE_OPTION_VALUES' => 'write_option_values',
        'READ_IMAGES' => 'read_images',
        'WRITE_IMAGES' => 'write_images',
        'READ_BRAND_REQUESTS' => 'read_brand_requests',
        'WRITE_BRAND_REQUESTS' => 'write_brand_requests',
        'READ_ORDERS' => 'read_orders',
        'WRITE_ORDERS' => 'write_orders',
    ];

    /**
     * @var array
     */
    public const MANAGER_PERMISSIONS = [
        self::PERMISSIONS['READ_PRODUCTS'],
        self::PERMISSIONS['WRITE_PRODUCTS'],
        self::PERMISSIONS['READ_PRODUCT_VARIANTS'],
        self::PERMISSIONS['WRITE_PRODUCT_VARIANTS'],
        self::PERMISSIONS['READ_CATEGORIES'],
        self::PERMISSIONS['READ_COLLECTIONS'],
        self::PERMISSIONS['READ_OPTIONS'],
        self::PERMISSIONS['READ_OPTION_VALUES'],
        self::PERMISSIONS['READ_IMAGES'],
        self::PERMISSIONS['WRITE_IMAGES'],
        self::PERMISSIONS['READ_ORDERS'],
        self::PERMISSIONS['WRITE_ORDERS'],
    ];

    /**
     * @var array
     */
    public const ADMIN_PERMISSIONS = [
        self::PERMISSIONS['READ_PRODUCTS'],
        self::PERMISSIONS['WRITE_PRODUCTS'],
        self::PERMISSIONS['READ_PRODUCT_VARIANTS'],
        self::PERMISSIONS['WRITE_PRODUCT_VARIANTS'],
        self::PERMISSIONS['READ_CATEGORIES'],
        self::PERMISSIONS['WRITE_CATEGORIES'],
        self::PERMISSIONS['READ_COLLECTIONS'],
        self::PERMISSIONS['WRITE_COLLECTIONS'],
        self::PERMISSIONS['READ_BRANDS'],
        self::PERMISSIONS['WRITE_BRANDS'],
        self::PERMISSIONS['WRITE_USERS'],
        self::PERMISSIONS['READ_USERS'],
        self::PERMISSIONS['WRITE_OPTIONS'],
        self::PERMISSIONS['READ_OPTIONS'],
        self::PERMISSIONS['WRITE_OPTION_VALUES'],
        self::PERMISSIONS['READ_OPTION_VALUES'],
        self::PERMISSIONS['READ_IMAGES'],
        self::PERMISSIONS['WRITE_IMAGES'],
        self::PERMISSIONS['READ_BRAND_REQUESTS'],
        self::PERMISSIONS['WRITE_BRAND_REQUESTS'],
        self::PERMISSIONS['READ_ORDERS'],
        self::PERMISSIONS['WRITE_ORDERS'],
    ];

    public function isAdmin(): bool
    {
        return $this->hasRole(self::ROLES['ADMIN']);
    }

    public function isManager(): bool
    {
        return $this->hasRole(self::ROLES['MANAGER']);
    }

    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }

    public function getNameAttribute(): ?string
    {
        return $this->first_name;
    }

    public function getBrand(): ?Brand
    {
        return $this->brands()->first();
    }

    public function scopeEmail(Builder $query, string $email): void
    {
        $query->where('users.email', $email);
    }

    /**
     * @return void
     */
    public function scopeAdmin(Builder $query)
    {
        $query->select('users.*')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', self::ROLES['ADMIN']);
    }

    /**
     * @return void
     */
    public function scopeManager(Builder $query)
    {
        $query->select('users.*')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', self::ROLES['MANAGER']);
    }
}
