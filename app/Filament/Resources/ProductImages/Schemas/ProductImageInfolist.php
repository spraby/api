<?php

namespace App\Filament\Resources\ProductImages\Schemas;

use Exception;
use Filament\Infolists\Components\ImageEntry;
use Filament\Schemas\Schema;

class ProductImageInfolist
{
    /**
     * @throws Exception
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                ImageEntry::make('image.url')
                    ->hiddenLabel()
                    ->columnSpanFull()
                    ->imageWidth('100%')
                    ->imageHeight('100%')
                    ->square(),
            ]);
    }
}
