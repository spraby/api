<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Shop';

    protected static ?int $navigationSort = 2;

    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.product.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.product.plural_label');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.product.navigation_label');
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        /**
         * @var User $user
         */
        $user = Auth::user();

        if ($user?->hasRole('admin')) return $query;

        $brand = $user->getBrand();

        return $query->when($brand, function (Builder $r) use ($brand) {
            $r->whereHas('brand', fn($q) => $q->where('brand_id', $brand->id));
        });
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make(__('filament-resources.resources.product.sections.general'))
                            ->schema([
                                Forms\Components\TextInput::make('title')
                                    ->label(__('filament-resources.resources.product.fields.title'))
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\RichEditor::make('description')
                                    ->label(__('filament-resources.resources.product.fields.description'))
                                    ->maxLength(65535)
                                    ->columnSpanFull(),
                            ]),

                        Forms\Components\Section::make(__('filament-resources.resources.product.sections.pricing'))
                            ->schema([
                                Forms\Components\TextInput::make('price')
                                    ->label(__('filament-resources.resources.product.fields.price'))
                                    ->required()
                                    ->numeric()
                                    ->prefix('$'),
                                Forms\Components\TextInput::make('final_price')
                                    ->label(__('filament-resources.resources.product.fields.final_price'))
                                    ->required()
                                    ->numeric()
                                    ->prefix('$'),
                            ]),
                    ])
                    ->columnSpan(['lg' => 2]),

                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make(__('filament-resources.resources.product.sections.status'))
                            ->schema([
                                Forms\Components\Toggle::make('enabled')
                                    ->label(__('filament-resources.resources.product.fields.enabled'))
                                    ->default(true),
                            ]),

                        Forms\Components\Section::make(__('filament-resources.resources.product.sections.associations'))
                            ->schema([
                                Forms\Components\Select::make('brand_id')
                                    ->label(__('filament-resources.resources.product.fields.brand_id'))
                                    ->relationship('brand', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->visible(fn() => Auth::user()?->hasRole('admin')),
                                Forms\Components\Select::make('category_id')
                                    ->label(__('filament-resources.resources.product.fields.category_id'))
                                    ->relationship('category', 'name', function (Builder $query, callable $get) {
                                        $user = Auth::user();
                                        $brandId = $get('brand_id') ?? $user->brands->first()?->id;

                                        $query->whereHas('brands', fn($q) => $q->where('brands.id', $brandId));
                                    })
                                    ->searchable()
                                    ->preload(),
                            ]),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label(__('filament-resources.resources.product.fields.title'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('brand.name')
                    ->label(__('filament-resources.resources.product.fields.brand_id'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label(__('filament-resources.resources.product.fields.category_id'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label(__('filament-resources.resources.product.fields.price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_price')
                    ->label(__('filament-resources.resources.product.fields.final_price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\IconColumn::make('enabled')
                    ->label(__('filament-resources.resources.product.fields.enabled'))
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('variants_count')
                    ->label(__('filament-resources.resources.product.fields.variants_count'))
                    ->counts('variants')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.product.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('brand_id')
                    ->label(__('filament-resources.resources.product.fields.brand_id'))
                    ->relationship('brand', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('category_id')
                    ->label(__('filament-resources.resources.product.fields.category_id'))
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('enabled')
                    ->label(__('filament-resources.resources.product.fields.enabled')),
                Tables\Filters\Filter::make('has_variants')
                    ->label(__('filament-resources.resources.product.filters.has_variants'))
                    ->query(fn(Builder $query): Builder => $query->has('variants')),
                Tables\Filters\Filter::make('has_images')
                    ->label(__('filament-resources.resources.product.filters.has_images'))
                    ->query(fn(Builder $query): Builder => $query->has('images')),
                Tables\Filters\Filter::make('has_orders')
                    ->label(__('filament-resources.resources.product.filters.has_orders'))
                    ->query(fn(Builder $query): Builder => $query->has('orderItems')),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ProductImagesRelationManager::class,
            RelationManagers\VariantsRelationManager::class,
//            RelationManagers\OrderItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
