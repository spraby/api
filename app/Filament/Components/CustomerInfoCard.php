<?php

namespace App\Filament\Components;

use App\Models\Order;
use Filament\Infolists\Components\Entry;

class CustomerInfoCard extends Entry
{
    protected string $view = 'filament.components.customer-info-card';

    public function getState(): array
    {
        $record = $this->getRecord();

        if (! $record instanceof Order) {
            return [];
        }

        return [
            'customer' => $record->customer,
            'label' => $this->label,
        ];
    }
}
