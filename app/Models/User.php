<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property string $id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string $email
 * @property string $role
 * @property string $password
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
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
     * @return HasMany
     */
    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }

    /**
     * @return string|null
     */
    public function getNameAttribute(): ?string
    {
        return $this->first_name;
    }

    /**
     * @return Brand|null
     */
    public function getBrand(): ?Brand
    {
        return $this->brands()->first();
    }

    /**
     * @param Builder $query
     * @param string $email
     * @return void
     */
    public function scopeEmail(Builder $query, string $email): void
    {
        $query->where('users.email', $email);
    }

    /**
     * @param Builder $query
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
     * @param Builder $query
     * @return void
     */
    public function scopeManager(Builder $query)
    {
        $query->select('users.*')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', self::ROLES['MANAGER']);;
    }
}
