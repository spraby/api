<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\Resources\ProductImages\ProductImageResource;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
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
            ->headerActions([
                Action::make('create')
                    ->label('Add image')
                    ->icon('heroicon-o-plus')
                    ->modalContent(view('livewire.image-picker.data', compact('product')))
                    ->modalHeading('Add images')
                    ->modalSubmitAction(false)
            ])
            ->toolbarActions([
                DeleteBulkAction::make(),
            ]);
    }
}
