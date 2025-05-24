<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class OrderShippingsRelationManager extends RelationManager
{
    protected static string $relationship = 'orderShippings';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('tracking_number')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.tracking_number'))
                    ->maxLength(255),
                Forms\Components\Select::make('status')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.status'))
                    ->options([
                        'pending' => 'Ожидает',
                        'packing' => 'Упаковка',
                        'shipped' => 'Отправлен',
                        'transit' => 'В пути',
                        'delivered' => 'Доставлен',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('carrier')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.carrier'))
                    ->maxLength(255),
                Forms\Components\Textarea::make('address')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.address'))
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('notes')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.notes'))
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tracking_number')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.tracking_number'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.status'))
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'packing' => 'warning',
                        'shipped' => 'info',
                        'transit' => 'primary',
                        'delivered' => 'success',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('carrier')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.carrier'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('address')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.address'))
                    ->limit(50)
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.created_at'))
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label(__('filament-resources.resources.order.relations.shippings.fields.status'))
                    ->options([
                        'pending' => 'Ожидает',
                        'packing' => 'Упаковка',
                        'shipped' => 'Отправлен',
                        'transit' => 'В пути',
                        'delivered' => 'Доставлен',
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
