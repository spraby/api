<?php

namespace App\Filament\Components;

use App\Models\Order;
use Closure;

use Filament\Infolists\Components\Component;
use Illuminate\Contracts\Support\Htmlable;

class OrderTimeLineCard extends Component
{
    protected string $view = 'filament.components.order-timeline';

    public function __construct(
        protected string|Htmlable|null|Closure $label = null,
    )
    {
    }

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
