<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

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
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class User extends Authenticatable
{
    use HasFactory;

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

    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }
}
