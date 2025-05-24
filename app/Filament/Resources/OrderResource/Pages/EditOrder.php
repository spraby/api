<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
            Actions\Action::make('view')
                ->label(__('filament-resources.resources.order.pages.edit.view'))
                ->url(fn () => OrderResource::getUrl('view', ['record' => $this->record]))
                ->icon('heroicon-o-eye'),
        ];
    }
}
