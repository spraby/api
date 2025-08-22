<?php

namespace App\Filament\Resources\ProductImages\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductImagesTable
{

    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    ImageColumn::make('image.url')
                        ->label('Image')
                        ->imageHeight('200px')
                        ->imageWidth('100%')
                        ->square()
                        ->extraImgAttributes([
                            'alt' => 'Image',
                            'loading' => 'lazy',
                        ]),
                    TextColumn::make('name')
                        ->searchable(),
                    TextColumn::make('position')
                        ->searchable(),
                ])
                    ->space(3),
            ])
            ->defaultSort('position')
            ->reorderable('position', direction: 'asc')
            ->filters([
                //
            ])
            ->contentGrid([
                'md' => 3,
                'xl' => 4,
            ])
            ->recordActions([
                ViewAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

}
