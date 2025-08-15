<?php

namespace App\Filament\Resources\Categories\RelationManagers;

use App\Filament\Resources\Options\OptionResource;
use Filament\Actions\DetachAction;
use Filament\Actions\AttachAction;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class OptionsRelationManager extends RelationManager
{
    protected static string $relationship = 'options';

    protected static ?string $relatedResource = OptionResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->recordActions([
                EditAction::make(),
                DetachAction::make()
            ])
            ->headerActions([
                AttachAction::make()
                    ->preloadRecordSelect(),
            ]);
    }
}
