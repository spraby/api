<?php

namespace App\Filament\Resources\OptionValueResource\Pages;

use App\Filament\Resources\OptionValueResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOptionValue extends EditRecord
{
    protected static string $resource = OptionValueResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
