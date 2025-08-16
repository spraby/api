<?php

namespace App\Filament\Resources\Variants;

use App\Filament\Resources\Variants\Pages\CreateVariant;
use App\Filament\Resources\Variants\Pages\EditVariant;
use App\Filament\Resources\Variants\Pages\ListVariants;
use App\Filament\Resources\Variants\Schemas\VariantForm;
use App\Filament\Resources\Variants\Tables\VariantsTable;
use App\Models\User;
use App\Models\Variant;
use BackedEnum;
use Exception;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;

class VariantResource extends Resource
{
    protected static ?string $model = Variant::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    protected static bool $shouldRegisterNavigation = false;

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        /**
         * @var User $user
         */
        $user = Auth::user();

        if ($user?->hasRole(User::ROLES['ADMIN'])) return $query;

        $brand = $user->getBrand();

        return $query->when($brand, function (Builder $r) use ($brand) {
            $r->join('products', function ($q) use ($brand) {
                $q->on('variants.product_id', '=', 'products.id')
                    ->where('products.brand_id', $brand->id);
            });
        });
    }

    /**
     * @throws Exception
     */
    public static function form(Schema $schema): Schema
    {
        return VariantForm::configure($schema);
    }

    /**
     * @throws Exception
     */
    public static function table(Table $table): Table
    {
        return VariantsTable::configure($table);
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
            'index' => ListVariants::route('/'),
            'create' => CreateVariant::route('/create'),
            'edit' => EditVariant::route('/{record}/edit'),
        ];
    }
}
