<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BrandResource\Pages;
use App\Filament\Resources\BrandResource\RelationManagers\{
    UserRelationManager,
    ProductsRelationManager,
    CategoriesRelationManager,
    OrdersRelationManager,
    ImagesRelationManager,
    SettingsRelationManager
};
use App\Models\Brand;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BrandResource extends Resource
{
    protected static ?string $model = Brand::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';

    protected static ?string $navigationGroup = 'Shop';

    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.brand.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.brand.plural_label');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.brand.navigation_label');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label(__('filament-resources.resources.brand.fields.name'))
                    ->required()
                    ->maxLength(255),
                Forms\Components\RichEditor::make('description')
                    ->label(__('filament-resources.resources.brand.fields.description'))
                    ->maxLength(65535)
                    ->toolbarButtons([
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'h2',
                        'h3',
                        'bulletList',
                        'orderedList',
                        'undo',
                        'redo',
                        'hr'
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label(__('filament-resources.resources.brand.fields.name'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('description')
                    ->label(__('filament-resources.resources.brand.fields.description'))
                    ->limit(50)
                    ->searchable(),
                Tables\Columns\TextColumn::make('products_count')
                    ->label(__('filament-resources.resources.brand.fields.products_count'))
                    ->counts('products')
                    ->sortable(),
                Tables\Columns\TextColumn::make('orders_count')
                    ->label(__('filament-resources.resources.brand.fields.orders_count'))
                    ->counts('orders')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.brand.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.brand.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('has_description')
                    ->label(__('filament-resources.resources.brand.filters.has_description'))
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('description')),
                Tables\Filters\Filter::make('has_products')
                    ->label(__('filament-resources.resources.brand.filters.has_products'))
                    ->query(fn (Builder $query): Builder => $query->has('products')),
                Tables\Filters\Filter::make('has_orders')
                    ->label(__('filament-resources.resources.brand.filters.has_orders'))
                    ->query(fn (Builder $query): Builder => $query->has('orders')),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
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
            UserRelationManager::class,
            ProductsRelationManager::class,
            CategoriesRelationManager::class,
            OrdersRelationManager::class,
            ImagesRelationManager::class,
            SettingsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBrands::route('/'),
            'create' => Pages\CreateBrand::route('/create'),
            'edit' => Pages\EditBrand::route('/{record}/edit'),
        ];
    }
}
