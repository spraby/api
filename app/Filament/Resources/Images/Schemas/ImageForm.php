<?php

namespace App\Filament\Resources\Images\Schemas;

use Exception;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
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
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                FileUpload::make('src')
                    ->disk('s3')
                    ->imageEditor()
                    ->directory('form-attachments')
                    ->visibility('private')
                    ->required(),
                TextInput::make('alt')
                    ->maxLength(255),
                Textarea::make('meta')
                    ->columnSpanFull(),
            ]);
    }
}
