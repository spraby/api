<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property array $data
 * @property string $key
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @method static Builder|static query()
 * @method static Builder|static menu()
 *
 * @mixin Builder
 */
class Settings extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';

    protected $guarded = [];

    public const KEYS = [
        'MENU' => 'menu',
        'INFO' => 'information',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * @return Model
     */
    public static function createMenu(array $data)
    {
        return self::create([
            'key' => self::KEYS['MENU'],
            'data' => $data,
        ]);
    }

    /**
     * @return Model
     */
    public static function createInformation(array $data)
    {
        return self::create([
            'key' => self::KEYS['INFO'],
            'data' => $data,
        ]);
    }

    /**
     * @return Builder
     */
    public function scopeMenu(Builder $query)
    {
        return $query->where('key', self::KEYS['MENU']);
    }
}
