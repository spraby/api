<?php

namespace App\Filament\Components;

use App\Models\Image;
use Closure;
use Filament\Forms\Components\Field;
use Illuminate\Database\Eloquent\Collection;

class ImagePicker extends Field
{
    protected string $view = 'filament.components.image-picker';

    /**
     * @var ?Collection<Image>
     */
    protected ?Collection $images = null;

    protected bool|Closure $isLabelHidden = true;

    public static function make(string $name): static
    {
        return parent::make($name);
    }

    public function images(Collection $images): static
    {
        $this->images = $images;

        return $this;
    }

    public function getImages(): ?Collection
    {
        return $this->images;
    }
}
