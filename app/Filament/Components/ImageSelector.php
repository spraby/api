<?php

namespace App\Filament\Components;

use Closure;
use Filament\Forms\Components\Field;

class ImageSelector extends Field
{
    protected string $view = 'filament.components.image-selector';

    protected array|Closure|null $images = null;

    protected bool|Closure $multiple = false;

    public function images(array|Closure $images): static
    {
        $this->images = $images;

        return $this;
    }

    public function getImages(): array
    {
        return $this->evaluate($this->images) ?? [];
    }

    public function multiple(bool|Closure $condition = true): static
    {
        $this->multiple = $condition;

        return $this;
    }

    public function isMultiple(): bool
    {
        return (bool) $this->evaluate($this->multiple);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->afterStateHydrated(static function (ImageSelector $component, $state): void {
            if ($component->isMultiple()) {
                $component->state(array_filter((array) $state));
            }
        });

        $this->dehydrateStateUsing(static function (ImageSelector $component, $state) {
            return $component->isMultiple()
                ? array_values(array_filter((array) $state))
                : $state;
        });

        $this->default(static function (ImageSelector $component) {
            return $component->isMultiple() ? [] : null;
        });
    }
}
