<?php

namespace App\Filament\Resources\OptionValues;

use App\Filament\Resources\OptionValues\Pages\CreateOptionValue;
use App\Filament\Resources\OptionValues\Pages\EditOptionValue;
use App\Filament\Resources\OptionValues\Pages\ListOptionValues;
use App\Filament\Resources\OptionValues\Schemas\OptionValueForm;
use App\Filament\Resources\OptionValues\Tables\OptionValuesTable;
use App\Models\OptionValue;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OptionValueResource extends Resource
{
    protected static ?string $model = OptionValue::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    protected static bool $shouldRegisterNavigation = false;

    public static function form(Schema $schema): Schema
    {
        return OptionValueForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OptionValuesTable::configure($table);
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
            'index' => ListOptionValues::route('/'),
            'create' => CreateOptionValue::route('/create'),
            'edit' => EditOptionValue::route('/{record}/edit'),
        ];
    }
}
