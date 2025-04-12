<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BrandResource\Pages;
use App\Filament\Resources\BrandResource\RelationManagers\UserRelationManager;
use App\Models\Brand;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BrandResource extends Resource
{
    protected static ?string $model = Brand::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';

    protected static ?string $navigationGroup = 'Shop';

    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.brand.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.brand.plural_label');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.brand.navigation_label');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label(__('filament-resources.resources.brand.fields.name'))
                    ->required()
                    ->maxLength(255),
                Forms\Components\RichEditor::make('description')
                    ->label(__('filament-resources.resources.brand.fields.description'))
                    ->maxLength(65535)
                    ->toolbarButtons([
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'h2',
                        'h3',
                        'bulletList',
                        'orderedList',
                        'undo',
                        'redo',
                        'hr'
                    ])
                    ->columnSpanFull(),

                Forms\Components\Section::make(__('filament-resources.resources.brand.fields.settings.label'))
                    ->schema([
                        Forms\Components\TextInput::make('settings.currency')
                            ->label(__('filament-resources.resources.brand.fields.settings.currency'))
                            ->maxLength(10),
                        Forms\Components\TextInput::make('settings.contact_email')
                            ->label(__('filament-resources.resources.brand.fields.settings.contact_email'))
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('settings.contact_phone')
                            ->label(__('filament-resources.resources.brand.fields.settings.contact_phone'))
                            ->tel()
                            ->maxLength(20),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('handle')
                    ->label(__('filament-resources.resources.brand.fields.handle'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('name')
                    ->label(__('filament-resources.resources.brand.fields.name'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('title')
                    ->label(__('filament-resources.resources.brand.fields.title')),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.brand.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.brand.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
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
            UserRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBrands::route('/'),
            'create' => Pages\CreateBrand::route('/create'),
            'edit' => Pages\EditBrand::route('/{record}/edit'),
        ];
    }
}
