<?php

namespace App\Filament\Resources\Brands\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BrandsTable
{
    /**
     * @throws \Exception
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('user.email')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('products_count')
                    ->label('Products count')
                    ->counts('products')
                    ->sortable(),
                TextColumn::make('orders_count')
                    ->label('Orders count')
                    ->counts('orders')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Filter::make('has_orders')
                    ->label('Has orders')
                    ->query(fn (Builder $query): Builder => $query->has('orders')),
                Filter::make('has_products')
                    ->label('Has products')
                    ->query(fn (Builder $query): Builder => $query->has('products')),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
