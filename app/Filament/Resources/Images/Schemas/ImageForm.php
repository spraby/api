<?php

namespace App\Filament\Resources\Images\Schemas;

use App\Models\User;
use Exception;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class ImageForm
{
    /**
     * @throws Exception
     */
    public static function configure(Schema $schema): Schema
    {
        $directoryPath = ['brands'];

        /**
         * @var User $user
         */
        $user = auth()->user();

        if ($user->isAdmin()) {
            $directoryPath[] = 'admin';
        } else if ($user->isManager()) {
            $brand = $user->getBrand();
            $directoryPath[] = $brand->id;
        }

        return $schema
            ->components([
                Grid::make()
                    ->columnSpanFull()
                    ->schema([
                        FileUpload::make('src')
                            ->columnSpanFull()
                            ->disk('s3')
                            ->image()
                            ->multiple()
                            ->imageEditor()
                            ->directory(implode('/', $directoryPath))
                            ->visibility('private')
                            ->required()
                            ->storeFileNamesIn('attachment_file_names')
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                    ]),

            ]);
    }
}
