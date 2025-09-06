<?php

namespace App\Filament\Resources\Images\Pages;

use App\Filament\Resources\Images\ImageResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateImage extends CreateRecord
{
    protected static string $resource = ImageResource::class;

    /**
     * @return string
     */
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    /**
     * @param array $data
     * @return Model
     */
    protected function handleRecordCreation(array $data): Model
    {
        $lastImage = null;

        foreach ($data['src'] as $path) {
            $imageData = [
                'src' => $path,
                'name' => $data['attachment_file_names'][$path] ?? basename($path),
                'alt' => '',
                'meta' => '',
            ];
            $lastImage = static::getModel()::create($imageData);
        }

        return $lastImage ?? new (static::getModel());
    }
}
