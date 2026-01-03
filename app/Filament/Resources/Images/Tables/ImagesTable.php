<?php

namespace App\Filament\Resources\Images\Tables;

use Exception;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ImagesTable
{
    /**
     * @throws Exception
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    ImageColumn::make('url')
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
                ])
                    ->space(3),
            ])
            ->filters([
                //
            ])
            ->contentGrid([
                'md' => 3,
                'xl' => 4,
            ])
            ->paginated([
                20,
                40,
                80,
                'all',
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
