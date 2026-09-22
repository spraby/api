<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string|null $user_id
 * @property string|null $image_id
 * @property string $name
 * @property string|null $employment_type
 * @property string $type
 * @property string|null $domain
 * @property string $page_status
 * @property Carbon|null $page_published_at
 * @property string|null $description
 * @property string|null $about
 * @property string|null $refund_policy
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read string|null $employment_type_label
 * @property-read User|null $user
 * @property-read Image|null $image
 * @property-read Collection<Product> $products
 * @property-read Collection<Category> $categories
 * @property-read Collection<Order> $orders
 * @property-read Collection<Image> $images
 * @property-read Collection<Address> $addresses
 * @property-read Collection<Contact> $contacts
 * @property-read Collection<ModerationRequest> $moderationRequests
 * @property-read Collection<ShippingMethod> $shippingMethods
 *
 * @method static Builder|static query()
 *
 * @mixin Builder
 */
class Brand extends Model
{
    use HasFactory;

    public const TYPE_MASTER = 'master';

    public const TYPE_BUSINESS = 'business';

    /** Тип бренда: мастер по умолчанию, бизнес — со своей страницей и доменом. */
    public const TYPES = [
        self::TYPE_MASTER,
        self::TYPE_BUSINESS,
    ];

    public const PAGE_STATUS_NONE = 'none';

    public const PAGE_STATUS_DRAFT = 'draft';

    public const PAGE_STATUS_PENDING = 'pending';

    public const PAGE_STATUS_PUBLISHED = 'published';

    /** Жизненный цикл страницы бренда: нет → черновик → на модерации → опубликована. */
    public const PAGE_STATUSES = [
        self::PAGE_STATUS_NONE,
        self::PAGE_STATUS_DRAFT,
        self::PAGE_STATUS_PENDING,
        self::PAGE_STATUS_PUBLISHED,
    ];

    public const EMPLOYMENT_TYPES = [
        'craftsman' => 'Ремесленник',
        'self_employed' => 'Самозанятый',
        'sole_proprietor' => 'ИП',
        'private_unitary_enterprise' => 'ЧУП',
        'llc' => 'ООО',
    ];

    protected $fillable = [
        'user_id',
        'image_id',
        'name',
        'employment_type',
        'type',
        'domain',
        'page_status',
        'page_published_at',
        'description',
        'about',
        'refund_policy',
    ];

    protected $casts = [
        'page_published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Снятый хэндл = страница недоступна: адреса у неё больше нет,
        // поэтому публикацию снимаем, откуда бы хэндл ни стирали.
        //
        // Внимание: событие модели не сработает на массовом обновлении
        // (Brand::query()->update() или DB::table('brands')->update()) —
        // домен нужно менять через сохранение модели.
        static::updating(function (Brand $brand) {
            if (! $brand->isDirty('domain') || $brand->domain !== null) {
                return;
            }

            if ($brand->page_status === self::PAGE_STATUS_PUBLISHED) {
                $brand->page_status = self::PAGE_STATUS_DRAFT;
                $brand->page_published_at = null;
            }
        });

        // У shipping_methods нет FK на бренд (связь через пивот) — без явной
        // зачистки записи бренда остались бы сиротами после каскадного удаления пивота.
        static::deleting(function (Brand $brand) {
            $brand->shippingMethods()->get()->each->delete();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Название формы занятости, либо null — поле необязательное, а незнакомое
     * значение (например, оставшееся от удалённого типа) названием не считаем.
     */
    public static function employmentTypeLabel(?string $type): ?string
    {
        return self::EMPLOYMENT_TYPES[$type] ?? null;
    }

    /**
     * Список для селектов: [['value' => ..., 'label' => ...], ...].
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function employmentTypeOptions(): array
    {
        return array_map(
            fn (string $value, string $label) => ['value' => $value, 'label' => $label],
            array_keys(self::EMPLOYMENT_TYPES),
            array_values(self::EMPLOYMENT_TYPES),
        );
    }

    public function getEmploymentTypeLabelAttribute(): ?string
    {
        return self::employmentTypeLabel($this->employment_type);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function images(): BelongsToMany
    {
        return $this->belongsToMany(Image::class);
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function contacts(): MorphMany
    {
        return $this->morphMany(Contact::class, 'contactable');
    }

    public function moderationRequests(): MorphMany
    {
        return $this->morphMany(ModerationRequest::class, 'source');
    }

    /**
     * Домен, предлагаемый по названию бренда: кириллица переводится
     * в латинскую транскрипцию (Str::slug с языком ru).
     * Нужен, когда домен у бренда ещё не назначен.
     */
    public function suggestedDomain(): string
    {
        return Str::slug($this->name, '-', 'ru') ?: 'brand-'.$this->id;
    }

    /**
     * Внешний адрес персональной страницы бренда.
     * domain — это хэндл в адресе витрины (/brand/<handle>), а не отдельный хост.
     * Пока хэндл не назначен, публичного адреса у страницы нет.
     */
    public function pageUrl(): ?string
    {
        if (! $this->domain) {
            return null;
        }

        return rtrim((string) config('app.store_url'), '/').'/brand/'.$this->domain;
    }

    public function shippingMethods(): BelongsToMany
    {
        return $this->belongsToMany(ShippingMethod::class);
    }

    public static function toMoney(float $value): string
    {
        $format = '{amount} BYN'; // @todo get form settings

        return str_replace('{amount}', number_format($value, 2, '.', ' '), $format);
    }
}
