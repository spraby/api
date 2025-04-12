<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SettingsRelationManager extends RelationManager
{
    protected static string $relationship = 'settings';

    protected static ?string $recordTitleAttribute = 'type';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('type')
                    ->label(__('filament-resources.resources.brand.relations.settings.fields.type'))
                    ->options([
                        'delivery' => __('filament-resources.resources.brand.relations.settings.types.delivery'),
                        'refund' => __('filament-resources.resources.brand.relations.settings.types.refund'),
                        'phones' => __('filament-resources.resources.brand.relations.settings.types.phones'),
                        'emails' => __('filament-resources.resources.brand.relations.settings.types.emails'),
                        'socials' => __('filament-resources.resources.brand.relations.settings.types.socials'),
                        'addresses' => __('filament-resources.resources.brand.relations.settings.types.addresses'),
                    ])
                    ->required()
                    ->unique(ignoreRecord: true),
                Forms\Components\KeyValue::make('data')
                    ->label(__('filament-resources.resources.brand.relations.settings.fields.data'))
                    ->keyLabel(__('filament-resources.resources.brand.relations.settings.fields.key'))
                    ->valueLabel(__('filament-resources.resources.brand.relations.settings.fields.value'))
                    ->addButtonLabel(__('filament-resources.resources.brand.relations.settings.actions.add'))
                    ->required()
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->label(__('filament-resources.resources.brand.relations.settings.fields.type'))
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => __("filament-resources.resources.brand.relations.settings.types.{$state}"))
                    ->colors([
                        'primary' => 'delivery',
                        'success' => 'refund',
                        'warning' => 'phones',
                        'danger' => 'emails',
                        'info' => 'socials',
                        'secondary' => 'addresses',
                    ])
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('data')
                    ->label(__('filament-resources.resources.brand.relations.settings.fields.data'))
                    ->formatStateUsing(fn (array $state): string => count($state) . ' ' . __('filament-resources.resources.brand.relations.settings.items'))
                    ->sortable(),
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
                Tables\Filters\SelectFilter::make('type')
                    ->label(__('filament-resources.resources.brand.relations.settings.fields.type'))
                    ->options([
                        'delivery' => __('filament-resources.resources.brand.relations.settings.types.delivery'),
                        'refund' => __('filament-resources.resources.brand.relations.settings.types.refund'),
                        'phones' => __('filament-resources.resources.brand.relations.settings.types.phones'),
                        'emails' => __('filament-resources.resources.brand.relations.settings.types.emails'),
                        'socials' => __('filament-resources.resources.brand.relations.settings.types.socials'),
                        'addresses' => __('filament-resources.resources.brand.relations.settings.types.addresses'),
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
