<?php

namespace App\Filament\Components;

use App\Models\Order;
use Filament\Infolists\Components\Component;

/**
 *
 */
class OrderItemsList extends Component
{
    protected string $view = 'filament.components.order-items-list';

    public static function make(): static
    {
        return app(static::class);
    }

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
