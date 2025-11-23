# Filament Admin Panel

[← Назад к оглавлению](./README.md)

## Обзор

Filament 4.0 предоставляет готовую админ-панель. Все ресурсы в `app/Filament/Resources/`.

## Структура Resources

```
app/Filament/Resources/
├── Brands/
│   └── BrandResource.php
├── Categories/
├── Collections/
├── Images/
├── Options/
├── OptionValues/
├── Orders/
├── Products/               # Основной ресурс
│   ├── ProductResource.php
│   ├── Pages/
│   │   ├── ListProducts.php
│   │   ├── CreateProduct.php
│   │   └── EditProduct.php
│   ├── Schemas/
│   │   └── ProductForm.php
│   ├── Tables/
│   │   └── ProductsTable.php
│   └── RelationManagers/
│       ├── VariantsRelationManager.php
│       └── ImagesRelationManager.php
├── ProductImages/
├── Users/
└── Variants/
```

## ProductResource

**Файл**: `app/Filament/Resources/Products/ProductResource.php`

```php
class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingCart;

    // Row Level Security
    public static function getEloquentQuery(): Builder {
        $query = parent::getEloquentQuery();
        $user = Auth::user();

        if ($user?->hasRole(User::ROLES['ADMIN'])) {
            return $query; // Админы видят всё
        }

        $brand = $user->getBrand();

        return $query->when($brand, function (Builder $r) use ($brand) {
            $r->whereHas('brand', fn($q) => $q->where('brand_id', $brand->id));
        });
    }

    public static function form(Schema $schema): Schema {
        return ProductForm::configure($schema);
    }

    public static function table(Table $table): Table {
        return ProductsTable::configure($table);
    }

    public static function getRelations(): array {
        return [
            RelationManagers\VariantsRelationManager::class,
            RelationManagers\ImagesRelationManager::class,
        ];
    }

    public static function getPages(): array {
        return [
            'index' => ListProducts::route('/'),
            'create' => CreateProduct::route('/create'),
            'edit' => EditProduct::route('/{record}/edit'),
        ];
    }
}
```

## Relation Managers

**VariantsRelationManager** - управление вариантами товара
**ImagesRelationManager** - управление изображениями товара

## Row Level Security

Менеджеры видят только данные своего бренда через `getEloquentQuery()`.

## Custom Components

### ImagePicker

**Файл**: `app/Livewire/ImagePicker.php`

Livewire компонент для выбора изображений из S3.

## Следующие шаги

- [Database →](./04-database.md)
- [Configuration →](./05-configuration.md)

[← Назад к оглавлению](./README.md)