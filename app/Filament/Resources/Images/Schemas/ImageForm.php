<?php

namespace App\Filament\Resources\Images\Schemas;

use Exception;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class ImageForm
{
    /**
     * @throws Exception
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make()
                    ->columnSpanFull()
                    ->schema([
                        FileUpload::make('src')
                            ->disk('s3')
                            ->imageEditor()
                            ->directory('form-attachments')
                            ->visibility('private')
                            ->required()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ]),
                        Grid::make(1)
                            ->schema([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('alt')
                                    ->maxLength(255),
                                TextInput::make('meta')
                                    ->maxLength(255),
                            ]),
                    ]),

            ]);
    }
}
