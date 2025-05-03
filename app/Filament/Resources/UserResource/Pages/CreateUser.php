<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function mutateFormDataAfterCreate(array $data): array
    {
        dd($data);
        $user = Auth::user();
        $data['brand_id'] = $user->brands->first()?->id;
        return $data;
    }
}
