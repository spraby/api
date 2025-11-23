# Laravel Models и доменная модель

[← Назад к оглавлению](./README.md)

## Обзор

18 Eloquent моделей в `app/Models/`. Все используют BigInt autoincrement ID.

## User

**Файл**: `app/Models/User.php`

```php
class User extends Authenticatable {
    use HasRoles; // Spatie Permission

    const ROLES = ['ADMIN' => 'admin', 'MANAGER' => 'manager'];

    const PERMISSIONS = [
        'READ_PRODUCTS', 'WRITE_PRODUCTS',
        'READ_CATEGORIES', 'WRITE_CATEGORIES',
        // ... 16 permissions total
    ];

    // Relationships
    public function brands(): HasMany

    // Methods
    public function isAdmin(): bool
    public function isManager(): bool
    public function getBrand(): ?Brand

    // Scopes
    public function scopeAdmin(Builder $query)
    public function scopeManager(Builder $query)
}
```

## Product

**Файл**: `app/Models/Product.php`

```php
class Product extends Model {
    protected $fillable = [
        'brand_id', 'category_id', 'title',
        'description', 'enabled', 'price', 'final_price'
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'price' => 'decimal:2',
        'final_price' => 'decimal:2',
    ];

    // Relationships
    public function brand(): BelongsTo
    public function category(): BelongsTo
    public function variants(): HasMany
    public function images(): HasMany
    public function media(): HasManyThrough // через ProductImage
    public function options(): HasManyThrough // через Category

    // Accessors
    public function getMainImageAttribute(): ?ProductImage
    public function getExternalUrlAttribute(): string // store URL
    public function getDiscountAttribute(): float

    // Methods
    public function reorderImages(): void

    // Lifecycle
    protected static function booted(): void {
        static::creating(fn($model) =>
            $model->brand_id = auth()->user()?->brands()?->first()?->id
        );
    }
}
```

## Brand

```php
public function user(): BelongsTo
public function products(): HasMany
public function categories(): BelongsToMany
public function settings(): HasMany
public function orders(): HasMany
public function images(): BelongsToMany

public static function toMoney(float $value): string
```

## Category

```php
protected $fillable = ['handle', 'name', 'title', 'header', 'description'];

public function brands(): BelongsToMany
public function products(): HasMany
public function options(): BelongsToMany
public function collections(): BelongsToMany
```

## Collection

```php
protected $fillable = ['handle', 'name', 'title', 'header', 'description'];

public function categories(): BelongsToMany
```

## Variant

```php
protected $fillable = ['product_id', 'image_id', 'title', 'price', 'final_price', 'enabled'];

public function product(): BelongsTo
public function image(): BelongsTo // ProductImage
public function values(): HasMany // VariantValue
public function orderItems(): HasMany

public function getDiscountAttribute(): float
```

## Option

```php
protected $fillable = ['name', 'title', 'description'];

public function values(): HasMany // OptionValue
public function categories(): BelongsToMany
```

## OptionValue

```php
protected $fillable = ['option_id', 'value', 'position'];

public function option(): BelongsTo
```

## Image

```php
protected $fillable = ['name', 'src', 'alt', 'meta'];

public function brands(): BelongsToMany
public function products(): BelongsToMany // через ProductImage

public function getUrlAttribute(): string {
    return Storage::disk('s3')->url($this->src);
}

protected static function booted(): void {
    static::created(fn($image) =>
        $image->brands()->syncWithoutDetaching(auth()->user()->getBrand()->id)
    );

    static::deleting(fn($image) =>
        Storage::disk('s3')->delete($image->src)
    );
}
```

## ProductImage

```php
protected $fillable = ['product_id', 'image_id', 'position'];

public function product(): BelongsTo
public function image(): BelongsTo
```

## Order

```php
use Auditable; // Trait для аудита

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'ARCHIVED'];
const DELIVERY_STATUSES = ['PENDING', 'PACKING', 'SHIPPED', 'TRANSIT', 'DELIVERED'];
const FINANCIAL_STATUSES = ['UNPAID', 'PAID', 'PARTIAL_PAID', 'REFUNDED'];

public function customer(): BelongsTo
public function brand(): BelongsTo
public function orderShippings(): HasMany
public function orderItems(): HasMany

public function getStatusUrlAttribute(): string
```

## OrderItem

```php
public function order(): BelongsTo
public function product(): BelongsTo
public function variant(): BelongsTo
```

## Customer

```php
protected $fillable = ['email', 'name', 'phone'];

public function orders(): HasMany
```

## Settings & BrandSettings

```php
// Settings - глобальные настройки (JSON)
protected $fillable = ['key', 'data'];
protected $casts = ['data' => 'array'];

// BrandSettings - настройки бренда (JSON)
protected $fillable = ['type', 'data', 'brand_id'];
protected $casts = ['data' => 'array'];
```

## ProductStatistics

```php
protected $fillable = ['product_id', 'type'];

public function product(): BelongsTo
```

## Важные паттерны

### Lifecycle Hooks

```php
protected static function booted(): void {
    static::creating(function ($model) { /* ... */ });
    static::created(function ($model) { /* ... */ });
    static::deleting(function ($model) { /* ... */ });
}
```

### Accessors

```php
public function getDiscountAttribute(): float {
    return round(($this->price - $this->final_price) / $this->price * 100, 0);
}
```

### Scopes

```php
public function scopeEnabled(Builder $query) {
    $query->where('enabled', true);
}
```

## Следующие шаги

- [Filament →](./03-filament.md)
- [Database →](./04-database.md)

[← Назад к оглавлению](./README.md)