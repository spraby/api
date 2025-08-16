<?php

namespace App\Filament\Components;

use App\Models\Order;
use Filament\Infolists\Components\Entry;

/**
 *
 */
class OrderItemsList extends Entry
{
    protected string $view = 'filament.components.order-items-list';



    public function getState(): array
    {
        $record = $this->getRecord();

        if (!$record instanceof Order) {
            return [];
        }

        return [
            'order' => $record,
        ];
    }
}
