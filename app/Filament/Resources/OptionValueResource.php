<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OptionValueResource\Pages;
use App\Filament\Resources\OptionValueResource\RelationManagers;
use App\Models\OptionValue;
use App\Models\Option;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class OptionValueResource extends Resource
{
    protected static ?string $model = OptionValue::class;

    protected static ?string $navigationIcon = 'heroicon-o-list-bullet';

    protected static ?string $navigationGroup = 'Shop';

    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.option-value.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.option-value.plural_label');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.option-value.navigation_label');
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
        return $user && $user->hasRole(User::ROLES['ADMIN']);
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('option_id')
                    ->label(__('filament-resources.resources.option-value.fields.option_id'))
                    ->options(Option::all()->pluck('name', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\TextInput::make('value')
                    ->label(__('filament-resources.resources.option-value.fields.value'))
                    ->required()
                    ->maxLength(255),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('option.name')
                    ->label(__('filament-resources.resources.option-value.fields.option_id'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('value')
                    ->label(__('filament-resources.resources.option-value.fields.value'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.option-value.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.option-value.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('option_id')
                    ->label(__('filament-resources.resources.option-value.fields.option_id'))
                    ->options(Option::all()->pluck('name', 'id'))
                    ->searchable(),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
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
            'index' => Pages\ListOptionValues::route('/'),
            'create' => Pages\CreateOptionValue::route('/create'),
            'edit' => Pages\EditOptionValue::route('/{record}/edit'),
        ];
    }
}
