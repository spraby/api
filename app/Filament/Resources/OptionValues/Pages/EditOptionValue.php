<?php

namespace App\Filament\Resources\OptionValues\Pages;

use App\Filament\Resources\OptionValues\OptionValueResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditOptionValue extends EditRecord
{
    protected static string $resource = OptionValueResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
