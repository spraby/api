# Анализ TypeScript типов vs Laravel моделей

Дата: 2026-01-10

## Общая информация

Файл с типами: `api/resources/js/admin/types/models.ts`

Все модели Laravel используют **BigInt** для ID (строковый тип в PHP PHPDoc: `@property string $id`), но в TypeScript типах указан `number`.

---

## 🔴 Критические несоответствия

### 1. User

**TypeScript:**
```typescript
interface User extends BaseModel {
    name: string;
    email: string;
    email_verified_at?: string;
    brand_id?: number;
    brands?: Brand[];
    roles?: Role[];
}
```

**Laravel Model (User.php):**
```php
@property string $id
@property string|null $first_name
@property string|null $last_name
@property string $email
@property string $password
@property-read Collection<Brand> $brands
```

**Fillable:**
```php
protected $fillable = [
    'first_name',
    'last_name',
    'email',
    'role',
    'password',
];
```

**Проблемы:**
- ❌ TS: `name: string` - в Laravel нет поля `name` в БД (есть accessor `getNameAttribute()` который возвращает `first_name`)
- ❌ TS: `brand_id?: number` - в Laravel нет этого поля (связь `hasMany` через `brands()`)
- ❌ TS: отсутствуют поля `first_name`, `last_name` (реальные поля БД)
- ⚠️ TS: `email_verified_at` есть, но не в `$fillable`

**Правильный тип:**
```typescript
interface User extends BaseModel {
    first_name: string | null;
    last_name: string | null;
    email: string;
    email_verified_at?: string;
    password?: string; // hidden field
    brands?: Brand[];
    roles?: Role[];
    // Computed
    name?: string; // accessor: возвращает first_name
}
```

---

### 2. Brand

**TypeScript:**
```typescript
interface Brand extends BaseModel {
    user_id: number | null;
    name: string;
    description?: string;
    user: User;
    categories: Category[]
}
```

**Laravel Model (Brand.php):**
```php
@property string $id
@property string|null $user_id
@property string $name
@property string|null $description
@property-read User|null $user
@property-read Collection<Product> $products
@property-read Collection<Category> $categories
@property-read Collection<BrandSettings> $settings
@property-read Collection<Order> $orders
@property-read Collection<Image> $images
```

**Проблемы:**
- ❌ TS: `user: User` (обязательное) - в Laravel `user: User|null` (nullable)
- ❌ TS: `categories: Category[]` (обязательное) - должно быть опциональным
- ❌ TS: отсутствуют отношения: `products`, `settings`, `orders`, `images`

**Правильный тип:**
```typescript
interface Brand extends BaseModel {
    user_id: number | null;
    name: string;
    description?: string | null;
    user?: User | null;
    categories?: Category[];
    products?: Product[];
    settings?: BrandSettings[];
    orders?: Order[];
    images?: Image[];
}
```

---

### 3. Product

**TypeScript:**
```typescript
interface Product extends BaseModel {
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    enabled: boolean;
    externalUrl?: string;
    mainImage?: string;
    brand?: Brand;
    category?: Category;
    variants?: Variant[];
    images?: ProductImage[];
}
```

**Laravel Model (Product.php):**
```php
@property string $id
@property string $brand_id
@property string|null $category_id
@property string $title
@property string|null $description
@property bool $enabled
@property string $price
@property string $final_price
@property float $discount // accessor
@property ProductImage $mainImage // accessor
@property string $externalUrl // accessor
```

**Fillable:**
```php
protected $fillable = [
    'brand_id',
    'category_id',
    'title',
    'description',
    'enabled',
    'price',
    'final_price',
];
```

**Проблемы:**
- ❌ TS: отсутствуют поля **`price`** и **`final_price`** (string в Laravel, decimal:2)
- ❌ TS: `externalUrl?: string` - это **accessor** (computed), не поле БД
- ❌ TS: `mainImage?: string` - это **accessor** типа `ProductImage`, не строка!
- ❌ TS: отсутствует **`discount`** (float, accessor)

**Правильный тип:**
```typescript
interface Product extends BaseModel {
    brand_id: number;
    category_id: number | null;
    title: string;
    description: string | null;
    enabled: boolean;
    price: string; // decimal:2 -> string
    final_price: string; // decimal:2 -> string
    brand?: Brand;
    category?: Category;
    variants?: Variant[];
    images?: ProductImage[];
    // Computed accessors
    externalUrl?: string;
    mainImage?: ProductImage | null;
    discount?: number; // float
}
```

---

### 4. Variant

**TypeScript:**
```typescript
interface Variant extends BaseModel {
    product_id: number;
    image_id: number | null;
    title: string | null;
    price: number;
    final_price: number;
    discount: number;
    enabled: boolean;
    product?: Product;
    image?: ProductImage | null,
    values?: VariantValue[];
}
```

**Laravel Model (Variant.php):**
```php
@property string $id
@property string $product_id
@property string|null $image_id
@property string|null $title
@property string $price // decimal:2
@property string $final_price // decimal:2
@property bool $enabled
@property float $discount // accessor
```

**Проблемы:**
- ❌ TS: `price: number` - в Laravel это **string** (decimal:2)
- ❌ TS: `final_price: number` - в Laravel это **string** (decimal:2)
- ❌ TS: `discount: number` - в Laravel это **float accessor** (computed), не поле БД

**Правильный тип:**
```typescript
interface Variant extends BaseModel {
    product_id: number;
    image_id: number | null;
    title: string | null;
    price: string; // decimal:2 -> string
    final_price: string; // decimal:2 -> string
    enabled: boolean;
    product?: Product;
    image?: ProductImage | null;
    values?: VariantValue[];
    // Computed
    discount?: number; // float accessor
}
```

---

### 5. Collection

**TypeScript:**
```typescript
interface Collection extends BaseModel {
    brand_id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    is_active: boolean;
    sort_order: number;
    meta_title?: string;
    meta_description?: string;
    brand?: Brand;
    products?: Product[];
}
```

**Laravel Model (Collection.php):**
```php
@property string $id
@property string $handle
@property string $name
@property string $title
@property string $header
@property string|null $description
@property-read CollectionEloquent<Category> $categories
```

**Проблемы:**
- 🔴 **ПОЛНОЕ НЕСООТВЕТСТВИЕ!** Модель Collection в Laravel имеет совершенно другие поля
- ❌ Laravel: `handle`, `title`, `header` - отсутствуют в TS
- ❌ TS: `brand_id`, `slug`, `image`, `is_active`, `sort_order`, `meta_title`, `meta_description` - НЕ СУЩЕСТВУЮТ в Laravel модели!
- ❌ Laravel: отношение `categories`, а не `products`

**Вероятно, в TypeScript типе описана ДРУГАЯ сущность или устаревшая структура!**

**Правильный тип (согласно Laravel):**
```typescript
interface Collection extends BaseModel {
    handle: string;
    name: string;
    title: string;
    header: string;
    description?: string | null;
    categories?: Category[];
}
```

---

### 6. Order

**TypeScript:**
```typescript
interface Order extends BaseModel {
    brand_id: number;
    customer_id?: number;
    order_number: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    subtotal: string;
    tax: string;
    shipping_cost: string;
    discount: string;
    total: string;
    currency: string;
    notes?: string;
    brand?: Brand;
    customer?: Customer;
    items?: OrderItem[];
    shipping?: OrderShipping;
}
```

**Laravel Model (Order.php):**
```php
@property string $id
@property string $name
@property string $customer_id
@property string $brand_id
@property string|null $note
@property string $status
@property string $delivery_status
@property string $financial_status
@property string $status_url // accessor
```

**Constants:**
```php
const STATUSES = [
    'PENDING' => 'pending',
    'CONFIRMED' => 'confirmed',
    'PROCESSING' => 'processing',
    'COMPLETED' => 'completed',
    'CANCELLED' => 'cancelled',
    'ARCHIVED' => 'archived',
];

const DELIVERY_STATUSES = [
    'PENDING' => 'pending',
    'PACKING' => 'packing',
    'SHIPPED' => 'shipped',
    'TRANSIT' => 'transit',
    'DELIVERED' => 'delivered',
];

const FINANCIAL_STATUSES = [
    'UNPAID' => 'unpaid',
    'PAID' => 'paid',
    'PARTIAL_PAID' => 'partial_paid',
    'REFUNDED' => 'refunded',
];
```

**Проблемы:**
- 🔴 **КРИТИЧЕСКОЕ НЕСООТВЕТСТВИЕ!** Структура Order в TS и Laravel полностью разная
- ❌ Laravel: `name` - отсутствует в TS
- ❌ TS: `order_number` - не существует в Laravel (есть `name`)
- ❌ TS: `status` enum неправильный (в Laravel: pending/confirmed/processing/completed/cancelled/archived)
- ❌ Laravel: `delivery_status` - отсутствует в TS
- ❌ Laravel: `financial_status` - в TS называется `payment_status` с другим enum
- ❌ TS: `subtotal`, `tax`, `shipping_cost`, `discount`, `total`, `currency` - НЕ СУЩЕСТВУЮТ в Laravel!
- ❌ TS: `notes` - в Laravel называется `note` (singular)
- ❌ Laravel: `status_url` accessor - отсутствует в TS

**Правильный тип:**
```typescript
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';
type DeliveryStatus = 'pending' | 'packing' | 'shipped' | 'transit' | 'delivered';
type FinancialStatus = 'unpaid' | 'paid' | 'partial_paid' | 'refunded';

interface Order extends BaseModel {
    name: string;
    customer_id: number;
    brand_id: number;
    note?: string | null;
    status: OrderStatus;
    delivery_status: DeliveryStatus;
    financial_status: FinancialStatus;
    brand?: Brand;
    customer?: Customer;
    orderShippings?: OrderShipping[];
    orderItems?: OrderItem[];
    // Computed
    status_url?: string; // accessor
}
```

---

### 7. OrderItem

**TypeScript:**
```typescript
interface OrderItem extends BaseModel {
    order_id: number;
    product_id: number;
    variant_id?: number;
    name: string;
    sku: string;
    quantity: number;
    price: string;
    subtotal: string;
    order?: Order;
    product?: Product;
    variant?: Variant;
}
```

**Laravel Model (OrderItem.php):**
```php
@property string $id
@property string $order_id
@property string|null $product_id
@property string|null $variant_id
@property string|null $image_id
@property string $title
@property string $variant_title
@property string|null $description
@property int $quantity
@property string $price // decimal:2
@property string $final_price // decimal:2
@property-read ProductImage|null $image
```

**Fillable:**
```php
protected $fillable = [
    'order_id',
    'product_id',
    'variant_id',
    'image_id',
    'title',
    'variant_title',
    'description',
    'quantity',
    'price',
    'final_price',
];
```

**Проблемы:**
- ❌ TS: `name` - в Laravel называется **`title`**
- ❌ TS: `sku` - НЕ СУЩЕСТВУЕТ в Laravel!
- ❌ TS: `subtotal` - НЕ СУЩЕСТВУЕТ в Laravel (есть `final_price`)
- ❌ Laravel: `variant_title` - отсутствует в TS
- ❌ Laravel: `description` - отсутствует в TS
- ❌ Laravel: `image_id` и отношение `image` - отсутствует в TS
- ❌ Laravel: `final_price` - отсутствует в TS

**Правильный тип:**
```typescript
interface OrderItem extends BaseModel {
    order_id: number;
    product_id: number | null;
    variant_id: number | null;
    image_id: number | null;
    title: string;
    variant_title: string;
    description?: string | null;
    quantity: number;
    price: string; // decimal:2
    final_price: string; // decimal:2
    order?: Order;
    product?: Product | null;
    variant?: Variant | null;
    image?: ProductImage | null;
}
```

---

### 8. OrderShipping

**TypeScript:**
```typescript
interface OrderShipping extends BaseModel {
    order_id: number;
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
    tracking_number?: string;
    carrier?: string;
    order?: Order;
}
```

**Laravel Model (OrderShipping.php):**
```php
@property string $id
@property string $order_id
@property string $name
@property string $phone
@property string $note
```

**Fillable:**
```php
protected $fillable = [
    'order_id',
    'name',
    'phone',
    'note',
];
```

**Проблемы:**
- 🔴 **КРИТИЧЕСКОЕ НЕСООТВЕТСТВИЕ!** Модель в Laravel имеет СОВЕРШЕННО ДРУГИЕ поля
- ❌ Laravel: только `name`, `phone`, `note`
- ❌ TS: все поля (`first_name`, `last_name`, `company`, `address_1`, `address_2`, `city`, `state`, `postal_code`, `country`, `tracking_number`, `carrier`) - НЕ СУЩЕСТВУЮТ в Laravel!

**Правильный тип:**
```typescript
interface OrderShipping extends BaseModel {
    order_id: number;
    name: string;
    phone: string;
    note: string;
    order?: Order;
}
```

---

### 9. Customer

**TypeScript:**
```typescript
interface Customer extends BaseModel {
    brand_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    brand?: Brand;
    orders?: Order[];
}
```

**Laravel Model (Customer.php):**
```php
@property string $id
@property string $email
@property string $name
@property string $phone
```

**Fillable:**
```php
protected $fillable = [
    'email',
    'name',
    'phone',
];
```

**Проблемы:**
- ❌ TS: `brand_id` - НЕ СУЩЕСТВУЕТ в Laravel!
- ❌ TS: `first_name`, `last_name` - в Laravel только одно поле **`name`**
- ❌ TS: `brand` - НЕ СУЩЕСТВУЕТ отношение в Laravel
- ❌ Laravel: `phone` обязательное, в TS опциональное

**Правильный тип:**
```typescript
interface Customer extends BaseModel {
    email: string;
    name: string;
    phone: string;
    orders?: Order[];
}
```

---

### 10. BrandSettings

**TypeScript:**
```typescript
interface BrandSettings extends BaseModel {
    brand_id: number;
    settings: Record<string, unknown>;
}
```

**Laravel Model (BrandSettings.php):**
```php
@property string $id
@property string $type
@property array $data
@property string $brand_id
```

**Constants:**
```php
const TYPES = [
    'REFUND' => 'refund',
    'ADDRESSES' => 'addresses',
    'DELIVERY' => 'delivery',
    'PHONES' => 'phones',
    'EMAILS' => 'emails',
    'SOCIALS' => 'socials',
];
```

**Проблемы:**
- ❌ TS: `settings` - в Laravel называется **`data`**
- ❌ Laravel: поле **`type`** - отсутствует в TS

**Правильный тип:**
```typescript
type BrandSettingsType = 'refund' | 'addresses' | 'delivery' | 'phones' | 'emails' | 'socials';

interface BrandSettings extends BaseModel {
    brand_id: number;
    type: BrandSettingsType;
    data: Record<string, unknown>;
    brand?: Brand;
}
```

---

## ⚠️ Средние несоответствия

### 11. ProductImage

**TypeScript:**
```typescript
interface ProductImage extends BaseModel {
    id: number;
    product_id: number;
    image_id: number;
    position: number;
    image?: Image;
}
```

**Laravel:**
```php
@property string $id
@property string $product_id
@property string $image_id
@property int $position
@property-read Image $image
@property-read Collection<Variant> $variants
@property-read Collection<OrderItem> $orderItems
```

**Проблемы:**
- ✅ Структура правильная
- ❌ TS: отсутствуют отношения `variants`, `orderItems`

**Дополнения:**
```typescript
interface ProductImage extends BaseModel {
    product_id: number;
    image_id: number;
    position: number;
    image?: Image;
    variants?: Variant[];
    orderItems?: OrderItem[];
}
```

---

### 12. Image

**TypeScript:**
```typescript
interface Image extends BaseModel {
    name: string;
    src: string;
    alt?: string;
    meta?: string;
    url?: string;
}
```

**Laravel:**
```php
@property string $id
@property string $name
@property string $src
@property string|null $alt
@property string|null $meta
@property string $url // accessor (S3 URL)
@property-read Collection<ProductImage> $productImages
@property-read Collection<Brand> $brands
```

**Проблемы:**
- ✅ Основные поля правильные
- ❌ TS: `url` accessor должен быть обязательным (не опциональным)
- ❌ TS: отсутствуют отношения `productImages`, `brands`

**Дополнения:**
```typescript
interface Image extends BaseModel {
    name: string;
    src: string;
    alt?: string | null;
    meta?: string | null;
    // Computed
    url: string; // accessor (always present)
    // Relations
    productImages?: ProductImage[];
    brands?: Brand[];
}
```

---

## ✅ Правильные типы

### 13. Option

✅ **Корректно!** Структура совпадает с Laravel моделью.

**Но отсутствует отношение:**
```typescript
interface Option extends BaseModel {
    name: string;
    title: string;
    description: string | null;
    values?: OptionValue[];
    categories?: Category[]; // добавить
    variantValues?: VariantValue[]; // добавить
}
```

---

### 14. OptionValue

✅ **Корректно!** Структура совпадает.

**Но отсутствует отношение:**
```typescript
interface OptionValue extends BaseModel {
    option_id: number;
    value: string;
    option?: Option;
    variantValues?: VariantValue[]; // добавить
}
```

---

### 15. VariantValue

✅ **Корректно!** Структура полностью совпадает.

---

### 16. Category

✅ **Корректно!** Структура совпадает.

**Но отсутствуют отношения:**
```typescript
interface Category extends BaseModel {
    handle: string;
    name: string;
    title: string;
    header: string;
    description: string | null;
    options?: Option[];
    collections?: Collection[]; // добавить
    brands?: Brand[]; // добавить
    products?: Product[]; // добавить
}
```

---

## 🔧 Системные исправления

### BaseModel

**Текущий:**
```typescript
interface BaseModel {
    id: number;
    created_at?: string;
    updated_at?: string;
}
```

**Проблема:**
- ❌ `id: number` - в Laravel используются **BigInt** (`string` в PHP типах)

**Правильный тип:**
```typescript
interface BaseModel {
    id: number; // или string для BigInt (зависит от frontend serialization)
    created_at?: string; // ISO 8601 string
    updated_at?: string; // ISO 8601 string
}
```

---

## 📋 Итоговые рекомендации

### Критические изменения (СРОЧНО):

1. **Order, OrderItem, OrderShipping** - полностью переписать типы
2. **Collection** - переписать согласно Laravel модели
3. **Customer** - удалить `brand_id`, заменить `first_name/last_name` на `name`
4. **Product, Variant** - добавить `price`, `final_price` (string), исправить `discount`
5. **User** - заменить `name` на `first_name/last_name`, удалить `brand_id`
6. **BrandSettings** - заменить `settings` на `type` + `data`

### Средние изменения:

7. Добавить недостающие отношения (relations) во все модели
8. Исправить nullable поля (`| null`)
9. Добавить computed accessors как опциональные поля с комментарием

### Рекомендации:

- Создать типы для всех enum констант из Laravel моделей
- Добавить JSDoc комментарии с указанием computed/accessor полей
- Синхронизировать типы с Prisma схемами в `admin/` и `store/`