<?php

namespace App\Filament\Resources\Images;

use App\Filament\Resources\Images\Pages\CreateImage;
use App\Filament\Resources\Images\Pages\EditImage;
use App\Filament\Resources\Images\Pages\ListImages;
use App\Filament\Resources\Images\Pages\ViewImage;
use App\Filament\Resources\Images\Schemas\ImageForm;
use App\Filament\Resources\Images\Schemas\ImageInfolist;
use App\Filament\Resources\Images\Tables\ImagesTable;
use App\Models\Image;
use App\Models\User;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;

class ImageResource extends Resource
{
    protected static ?string $model = Image::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFilm;

    protected static ?string $navigationLabel = 'Media';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return ImageForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ImagesTable::configure($table);
    }

    /**
     * @return bool
     */
    public static function canAccess(): bool
    {
        /**
         * @var User $user
         */
        $user = auth()->user();
        if ($user && $user->isAdmin()) return true;
        if ($user && $user->isManager() && $user->getBrand()) return true;
        return false;
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        /**
         * @var User $user
         */
        $user = Auth::user();

        if ($user?->hasRole('admin')) return $query;

        $brand = $user->getBrand();

        if ($brand) {
            return $query->join('brand_image', 'images.id', '=', 'brand_image.image_id')
                ->where('brand_image.brand_id', $brand->id);
        } else {
            return $query->whereNull('id');
        }
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListImages::route('/'),
            'create' => CreateImage::route('/create'),
            'edit' => EditImage::route('/{record}/edit'),
        ];
    }
}
