<?php

namespace App\Filament\Resources\Images\Pages;

use App\Filament\Resources\Images\ImageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;

class ListImages extends ListRecords
{
    protected static string $resource = ImageResource::class;

    protected ?string $heading = 'Media';

    protected ?string $subheading = 'Manage your media';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->icon(Heroicon::OutlinedArrowUpTray)
                ->label('Upload images'),
        ];
    }
}
