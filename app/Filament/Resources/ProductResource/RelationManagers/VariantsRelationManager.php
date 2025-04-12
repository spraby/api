<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.title'))
                    ->maxLength(255),
                Forms\Components\TextInput::make('price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.price'))
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                Forms\Components\TextInput::make('final_price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.final_price'))
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                Forms\Components\Select::make('image_id')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.image_id'))
                    ->relationship('image', 'id')
                    ->getOptionLabelFromRecordUsing(fn ($record) => "Image #{$record->id}")
                    ->searchable(),
                Forms\Components\Section::make(__('filament-resources.resources.product.relations.variants.sections.options'))
                    ->schema([
                        Forms\Components\Repeater::make('values')
                            ->label(__('filament-resources.resources.product.relations.variants.fields.values'))
                            ->relationship()
                            ->schema([
                                Forms\Components\Select::make('option_id')
                                    ->label(__('filament-resources.resources.product.relations.variants.fields.option_id'))
                                    ->relationship('option', 'name')
                                    ->required()
                                    ->reactive()
                                    ->searchable()
                                    ->preload(),
                                Forms\Components\Select::make('option_value_id')
                                    ->label(__('filament-resources.resources.product.relations.variants.fields.option_value_id'))
                                    ->relationship('value', 'value', function (Builder $query, $get) {
                                        return $query->where('option_id', $get('option_id'));
                                    })
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->createOptionForm([
                                        Forms\Components\TextInput::make('value')
                                            ->required()
                                            ->maxLength(255),
                                    ]),
                            ])
                            ->columns(2)
                            ->defaultItems(0),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.title'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.final_price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('values_count')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.values_count'))
                    ->counts('values')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('has_image')
                    ->label(__('filament-resources.resources.product.relations.variants.filters.has_image'))
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('image_id')),
                Tables\Filters\Filter::make('has_values')
                    ->label(__('filament-resources.resources.product.relations.variants.filters.has_values'))
                    ->query(fn (Builder $query): Builder => $query->has('values')),
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
