<?php

namespace App\Filament\Components;

use Illuminate\View\Component;

/**
 *
 */
class Copyable extends Component
{
    public string $text;
    public bool $copied = false;

    public function __construct(string $text)
    {
        $this->text = $text;
    }

    /**
     * @param string $text
     * @return self
     */
    public static function make(string $text): self
    {
        return new self($text);
    }

    public function render()
    {
        return view('filament.components.copyable');
    }
}
