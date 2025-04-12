<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OrderItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'orderItems';

    protected static ?string $recordTitleAttribute = 'id';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('order_id')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.order_id'))
                    ->relationship('order', 'number')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('variant_id')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.variant_id'))
                    ->relationship('variant', 'id', function (Builder $query, $get) {
                        return $query->where('product_id', $this->ownerRecord->id);
                    })
                    ->getOptionLabelFromRecordUsing(function ($record) {
                        return $record->title ?? "Variant #{$record->id}";
                    })
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('quantity')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.quantity'))
                    ->required()
                    ->numeric()
                    ->default(1)
                    ->minValue(1),
                Forms\Components\TextInput::make('price')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.price'))
                    ->required()
                    ->numeric()
                    ->prefix('$'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order.number')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.order_id'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('variant.title')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.variant_id'))
                    ->formatStateUsing(fn ($state, $record) => $state ?? "Variant #{$record->variant_id}")
                    ->searchable(),
                Tables\Columns\TextColumn::make('quantity')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.quantity'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('total')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.total'))
                    ->money()
                    ->state(function ($record) {
                        return $record->price * $record->quantity;
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('order_id')
                    ->label(__('filament-resources.resources.product.relations.order_items.fields.order_id'))
                    ->relationship('order', 'number')
                    ->searchable()
                    ->preload(),
                Tables\Filters\Filter::make('has_variant')
                    ->label(__('filament-resources.resources.product.relations.order_items.filters.has_variant'))
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('variant_id')),
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
            ->defaultSort('created_at', 'desc');
    }
}
