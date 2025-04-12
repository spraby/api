<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\FileUpload::make('path')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.path'))
                    ->image()
                    ->imageEditor()
                    ->required(),
                Forms\Components\TextInput::make('alt')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.alt'))
                    ->maxLength(255),
                Forms\Components\Select::make('type')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.type'))
                    ->options([
                        'logo' => __('filament-resources.resources.brand.relations.images.types.logo'),
                        'banner' => __('filament-resources.resources.brand.relations.images.types.banner'),
                        'gallery' => __('filament-resources.resources.brand.relations.images.types.gallery'),
                    ])
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('path')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.path')),
                Tables\Columns\TextColumn::make('alt')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.alt'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.type'))
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => __("filament-resources.resources.brand.relations.images.types.{$state}"))
                    ->colors([
                        'primary' => 'logo',
                        'warning' => 'banner',
                        'success' => 'gallery',
                    ])
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.brand.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label(__('filament-resources.resources.brand.relations.images.fields.type'))
                    ->options([
                        'logo' => __('filament-resources.resources.brand.relations.images.types.logo'),
                        'banner' => __('filament-resources.resources.brand.relations.images.types.banner'),
                        'gallery' => __('filament-resources.resources.brand.relations.images.types.gallery'),
                    ]),
            ])
            ->headerActions([
                Tables\Actions\AttachAction::make(),
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DetachAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DetachBulkAction::make(),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
