<?php

namespace App\Filament\Resources\Images\Pages;

use App\Filament\Resources\Images\ImageResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateImage extends CreateRecord
{
    protected static string $resource = ImageResource::class;

    protected ?string $heading = 'Upload images';

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function handleRecordCreation(array|string $data): Model
    {
        $lastImage = null;

        if (is_array($data)) {
            foreach ($data['src'] as $path) {
                $imageData = [
                    'src' => $path,
                    'name' => $data['attachment_file_names'][$path] ?? basename($path),
                    'alt' => '',
                    'meta' => '',
                ];
                $lastImage = static::getModel()::create($imageData);
            }
        }

        return $lastImage ?? new (static::getModel());
    }

    protected function getFormActions(): array
    {
        return [
            $this->getCreateFormAction()->label('Save images'),
            $this->getCancelFormAction()->label('Cancel'),
        ];
    }
}
