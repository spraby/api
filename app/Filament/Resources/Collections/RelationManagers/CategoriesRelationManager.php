<?php

namespace App\Filament\Resources\Collections\RelationManagers;

use App\Filament\Resources\Categories\CategoryResource;
use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class CategoriesRelationManager extends RelationManager
{
    protected static string $relationship = 'categories';

    protected static ?string $relatedResource = CategoryResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->recordActions([
                EditAction::make(),
                DetachAction::make(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->preloadRecordSelect(),
            ]);
    }
}
