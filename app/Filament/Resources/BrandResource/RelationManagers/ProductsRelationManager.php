<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ProductsRelationManager extends RelationManager
{
    protected static string $relationship = 'products';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label(__('filament-resources.resources.brand.relations.products.fields.name'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label(__('filament-resources.resources.brand.relations.products.fields.price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.brand.fields.created_at'))
                    ->dateTime()
                    ->sortable()
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }
}
