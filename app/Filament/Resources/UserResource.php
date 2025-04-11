<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers\BrandsRelationManager;
use App\Models\User;
use Filament\Forms\Components\{TextInput, Select, Grid, DateTimePicker};
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\{TextColumn, BadgeColumn};
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Filament\Forms\Components\DatePicker;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    
    protected static ?string $navigationGroup = 'Users';
    
    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.user.label');
    }
    
    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.user.plural_label');
    }
    
    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.user.navigation_label');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Grid::make(2)->schema([
                TextInput::make('first_name')
                    ->label(__('filament-resources.resources.user.fields.first_name'))
                    ->required()
                    ->maxLength(255),

                TextInput::make('last_name')
                    ->label(__('filament-resources.resources.user.fields.last_name'))
                    ->maxLength(255),
            ]),

            TextInput::make('email')
                ->label(__('filament-resources.resources.user.fields.email'))
                ->email()
                ->required()
                ->unique(ignoreRecord: true),

            TextInput::make('password')
                ->label(__('filament-resources.resources.user.fields.password'))
                ->password()
                ->maxLength(255)
                ->dehydrateStateUsing(fn ($state) => filled($state) ? Hash::make($state) : null)
                ->dehydrated(fn ($state) => filled($state))
                ->required(fn (string $context) => $context === 'create'),

            Select::make('role')
                ->label(__('filament-resources.resources.user.fields.role'))
                ->options([
                    'admin' => 'Admin',
                    'manager' => 'Manager',
                    'user' => 'User',
                ])
                ->required(),

            DateTimePicker::make('created_at')
                ->label(__('filament-resources.resources.user.fields.created_at'))
                ->disabled()
                ->dehydrated(false)
                ->visible(fn (string $context): bool => $context === 'edit'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('first_name')
                    ->label(__('filament-resources.resources.user.fields.first_name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('last_name')
                    ->label(__('filament-resources.resources.user.fields.last_name'))
                    ->sortable(),
                TextColumn::make('email')
                    ->label(__('filament-resources.resources.user.fields.email'))
                    ->searchable(),
                BadgeColumn::make('role')
                    ->label(__('filament-resources.resources.user.fields.role'))
                    ->colors([
                        'primary' => 'user',
                        'warning' => 'manager',
                        'danger' => 'admin',
                    ]),
                TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.user.fields.created_at'))
                    ->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'admin' => 'Admin',
                        'manager' => 'Manager',
                        'user' => 'User',
                    ])
                    ->label(__('filament-resources.resources.user.fields.role')),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from'),
                        DatePicker::make('created_until'),
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
            ]);
    }

    public static function getRelations(): array
    {
        return [
            BrandsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
