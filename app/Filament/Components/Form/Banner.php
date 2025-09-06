<?php

namespace App\Filament\Components\Form;

use Filament\Forms\Components\Field;

class Banner extends Field
{

    const TYPES = [
        'INFO' => 'info',
        'WARNING' => 'warning',
        'DANGER' => 'danger'
    ];

    /**
     * @var string
     */
    protected string $view = 'filament.components.form.banner';

    /**
     * @var string|null
     */
    protected string|null $header = null;

    /**
     * @var string|null
     */
    protected string|null $type = self::TYPES['INFO'];

    /**
     * @param string $header
     * @return $this
     */
    public function setHeader(string $header): static
    {
        $this->header = $header;
        return $this;
    }

    /**
     * @param string $type
     * @return $this
     */
    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getHeader(): string|null
    {
        return $this->header;
    }

    /**
     * @return string|null
     */
    public function getType(): string|null
    {
        return $this->type;
    }
}
