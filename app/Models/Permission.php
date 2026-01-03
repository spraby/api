<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $name
 * @property string $guard_name
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @mixin Builder
 */
class Permission extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const PERMISSIONS = [
        'READ_PRODUCTS' => 'read_products',
        'WRITE_PRODUCTS' => 'read_products',
    ];

    const MANAGER_PERMISSIONS = [
        self::PERMISSIONS['READ_PRODUCTS'],
        self::PERMISSIONS['WRITE_PRODUCTS'],
    ];
}
