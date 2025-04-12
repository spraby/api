<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class OrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'orders';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('number')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.number'))
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('total')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.total'))
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                Forms\Components\Select::make('status')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.status'))
                    ->options([
                        'pending' => __('filament-resources.resources.brand.relations.orders.statuses.pending'),
                        'processing' => __('filament-resources.resources.brand.relations.orders.statuses.processing'),
                        'completed' => __('filament-resources.resources.brand.relations.orders.statuses.completed'),
                        'cancelled' => __('filament-resources.resources.brand.relations.orders.statuses.cancelled'),
                    ])
                    ->required(),
                Forms\Components\Select::make('customer_id')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.customer'))
                    ->relationship('customer', 'name')
                    ->searchable()
                    ->preload()
                    ->createOptionForm([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->tel()
                            ->maxLength(20),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('number')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.number'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.name')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.customer'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('total')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.total'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.status'))
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => __("filament-resources.resources.brand.relations.orders.statuses.{$state}"))
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'processing' => 'warning',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('items_count')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.items_count'))
                    ->counts('orderItems')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.brand.fields.created_at'))
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label(__('filament-resources.resources.brand.relations.orders.fields.status'))
                    ->options([
                        'pending' => __('filament-resources.resources.brand.relations.orders.statuses.pending'),
                        'processing' => __('filament-resources.resources.brand.relations.orders.statuses.processing'),
                        'completed' => __('filament-resources.resources.brand.relations.orders.statuses.completed'),
                        'cancelled' => __('filament-resources.resources.brand.relations.orders.statuses.cancelled'),
                    ]),
                Tables\Filters\Filter::make('has_shipping')
                    ->label(__('filament-resources.resources.brand.relations.orders.filters.has_shipping'))
                    ->query(fn (Builder $query): Builder => $query->has('shipping')),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
