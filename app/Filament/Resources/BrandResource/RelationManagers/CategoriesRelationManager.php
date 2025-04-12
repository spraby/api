<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;

class CategoriesRelationManager extends RelationManager
{
    protected static string $relationship = 'categories';

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Название категории'),
            ])
            ->headerActions([])
            ->actions([
                Tables\Actions\DetachAction::make(),
            ]);
    }
}
