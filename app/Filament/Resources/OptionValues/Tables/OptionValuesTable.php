<?php

namespace App\Filament\Resources\OptionValues\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class OptionValuesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('value')
            ->reorderable('position')
            ->columns([
                TextColumn::make('position')
                    ->sortable(),
                TextColumn::make('value')
                    ->searchable()
                    ->sortable(),
            ])
            ->filters([
                //
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
