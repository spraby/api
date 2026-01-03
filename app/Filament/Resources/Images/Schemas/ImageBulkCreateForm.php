<?php

namespace App\Filament\Resources\Images\Schemas;

use Exception;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class ImageBulkCreateForm
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
                            ->columnSpanFull()
                            ->multiple()
                            ->image()
                            ->disk('s3')
                            ->imageEditor()
                            ->directory('form-attachments')
                            ->visibility('private')
                            ->required()
                            ->storeFileNamesIn('attachment_file_names')
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ]),
                    ]),
            ]);
    }
}
