<?php

namespace App\Filament\Resources\Options;

use App\Filament\Resources\Options\Pages\CreateOption;
use App\Filament\Resources\Options\Pages\EditOption;
use App\Filament\Resources\Options\Pages\ListOptions;
use App\Filament\Resources\Options\Schemas\OptionForm;
use App\Filament\Resources\Options\Tables\OptionsTable;
use App\Models\Option;
use App\Models\User;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OptionResource extends Resource
{
    protected static ?string $model = Option::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQueueList;

    protected static ?string $recordTitleAttribute = 'name';

    /**
     * @return bool
     */
    public static function canAccess(): bool
    {
        /**
         * @var User $user
         */
        $user = auth()->user();
        return $user && $user->hasRole(User::ROLES['ADMIN']);
    }

    public static function form(Schema $schema): Schema
    {
        return OptionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OptionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ValuesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOptions::route('/'),
            'create' => CreateOption::route('/create'),
            'edit' => EditOption::route('/{record}/edit'),
        ];
    }
}
