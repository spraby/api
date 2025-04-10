<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property string $id
 * @property array $data
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Settings extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $fillable = ['id', 'data'];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
