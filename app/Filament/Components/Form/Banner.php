<?php

namespace App\Filament\Components\Form;

use Filament\Forms\Components\Field;

class Banner extends Field
{
    const TYPES = [
        'INFO' => 'info',
        'WARNING' => 'warning',
        'DANGER' => 'danger',
    ];

    protected string $view = 'filament.components.form.banner';

    protected ?string $header = null;

    protected ?string $type = self::TYPES['INFO'];

    /**
     * @return $this
     */
    public function setHeader(string $header): static
    {
        $this->header = $header;

        return $this;
    }

    /**
     * @return $this
     */
    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getHeader(): ?string
    {
        return $this->header;
    }

    public function getType(): ?string
    {
        return $this->type;
    }
}
