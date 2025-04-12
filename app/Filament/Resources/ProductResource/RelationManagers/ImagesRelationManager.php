<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('image_id')
                    ->label(__('filament-resources.resources.product.relations.images.fields.image_id'))
                    ->relationship('image', 'name')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->createOptionForm([
                        Forms\Components\TextInput::make('name')
                            ->label(__('filament-resources.resources.product.relations.images.fields.name'))
                            ->required()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make('src')
                            ->label(__('filament-resources.resources.product.relations.images.fields.src'))
                            ->image()
                            ->required(),
                        Forms\Components\TextInput::make('alt')
                            ->label(__('filament-resources.resources.product.relations.images.fields.alt'))
                            ->maxLength(255),
                    ]),
                Forms\Components\TextInput::make('position')
                    ->label(__('filament-resources.resources.product.relations.images.fields.position'))
                    ->integer()
                    ->default(0)
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image.src')
                    ->label(__('filament-resources.resources.product.relations.images.fields.preview')),
                Tables\Columns\TextColumn::make('image.name')
                    ->label(__('filament-resources.resources.product.relations.images.fields.name'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('image.alt')
                    ->label(__('filament-resources.resources.product.relations.images.fields.alt'))
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('position')
                    ->label(__('filament-resources.resources.product.relations.images.fields.position'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('variants_count')
                    ->label(__('filament-resources.resources.product.relations.images.fields.variants_count'))
                    ->counts('variants')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('has_variants')
                    ->label(__('filament-resources.resources.product.relations.images.filters.has_variants'))
                    ->query(fn (Builder $query): Builder => $query->has('variants')),
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
            ])
            ->defaultSort('position');
    }
}
