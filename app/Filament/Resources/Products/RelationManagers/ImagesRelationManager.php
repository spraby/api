<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\Resources\ProductImages\ProductImageResource;
use Filament\Actions\Action;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    protected static ?string $relatedResource = ProductImageResource::class;

    public function table(Table $table): Table
    {
        $product = $this->getOwnerRecord();

        return $table
            ->heading('')
            ->headerActions([])
            ->toolbarActions([
                Action::make('create')
                    ->label('Add image')
                    ->icon('heroicon-o-plus')
                    ->modalContent(view('livewire.image-picker.data', compact('product')))
                    ->modalHeading('Edit Variant')
                    ->modalSubmitAction(false)
            ]);
    }
}
