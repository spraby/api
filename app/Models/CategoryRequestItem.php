<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $category_request_id
 * @property int $category_id
 * @property string $status
 * @property string|null $rejection_reason
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read CategoryRequest $request
 * @property-read Category $category
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class CategoryRequestItem extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'category_request_id',
        'category_id',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(CategoryRequest::class, 'category_request_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
