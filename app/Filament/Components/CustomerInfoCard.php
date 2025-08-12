<?php

namespace App\Filament\Components;

use App\Models\Order;
use Closure;

use Filament\Infolists\Components\Component;
use Illuminate\Contracts\Support\Htmlable;

class CustomerInfoCard extends Component
{
    protected string $view = 'filament.components.customer-info-card';

    public function __construct(
        protected string|Htmlable|null|Closure $label = null,
    )
    {
    }

    public static function make(?string $label = null): static
    {
        return app(static::class, ['label' => $label]);
    }

    public function getState(): array
    {
        $record = $this->getRecord();

        if (!$record instanceof Order) {
            return [];
        }

        return [
            'customer' => $record->customer,
            'label' => $this->label,
        ];
    }
}
