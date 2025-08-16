<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OrdersTable
{
    /**
     * @throws \Exception
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('filament-resources.resources.order.fields.name'))
                    ->copyable()
                    ->searchable()
                    ->sortable(),
                TextColumn::make('customer.email')
                    ->label(__('filament-resources.resources.order.fields.customer_id'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('status')
                    ->label(__('filament-resources.resources.order.fields.status'))
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        Order::STATUSES['PENDING'] => 'gray',
                        Order::STATUSES['CONFIRMED'] => 'info',
                        Order::STATUSES['PROCESSING'] => 'warning',
                        Order::STATUSES['COMPLETED'] => 'success',
                        Order::STATUSES['CANCELLED'] => 'danger',
                        Order::STATUSES['ARCHIVED'] => 'slate',
                        default => 'gray',
                    })->action(Action::make('updateStatus')
                        ->label('Change Status')
                        ->schema([
                            Select::make('status')
                                ->options(array_flip(Order::STATUSES))
                                ->default(fn($record) => $record->status)
                        ])
                        ->action(function ($record, $data) {
                            $record->update(['status' => $data['status']]);
                            Notification::make()
                                ->title('Status updated!')
                                ->success()
                                ->send();
                        })
                    )
                    ->sortable(),
                TextColumn::make('financial_status')
                    ->label(__('filament-resources.resources.order.fields.financial_status'))
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        Order::FINANCIAL_STATUSES['UNPAID'] => 'danger',
                        Order::FINANCIAL_STATUSES['PAID'] => 'success',
                        Order::FINANCIAL_STATUSES['PARTIAL_PAID'] => 'warning',
                        Order::FINANCIAL_STATUSES['REFUNDED'] => 'slate',
                        default => 'gray',
                    })
                    ->icon(fn(string $state): string => match ($state) {
                        Order::FINANCIAL_STATUSES['UNPAID'] => 'heroicon-o-credit-card',
                        Order::FINANCIAL_STATUSES['PAID'] => 'heroicon-o-banknotes',
                        Order::FINANCIAL_STATUSES['PARTIAL_PAID'] => 'heroicon-o-currency-dollar',
                        Order::FINANCIAL_STATUSES['REFUNDED'] => 'heroicon-o-arrow-uturn-left',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->action(Action::make('updateFinancialStatus')
                        ->label('Change Financial Status')
                        ->schema([
                            Select::make('financial_status')
                                ->options(array_flip(Order::FINANCIAL_STATUSES))
                                ->default(fn($record) => $record->financial_status)
                        ])
                        ->action(function ($record, $data) {
                            $record->update(['financial_status' => $data['financial_status']]);
                            Notification::make()
                                ->title('Financial status updated!')
                                ->success()
                                ->send();
                        })
                    )
                    ->sortable(),
                TextColumn::make('delivery_status')
                    ->label(__('filament-resources.resources.order.fields.delivery_status'))
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        Order::DELIVERY_STATUSES['PENDING'] => 'gray',
                        Order::DELIVERY_STATUSES['PACKING'] => 'blue',
                        Order::DELIVERY_STATUSES['SHIPPED'] => 'info',
                        Order::DELIVERY_STATUSES['TRANSIT'] => 'warning',
                        Order::DELIVERY_STATUSES['DELIVERED'] => 'success',
                        default => 'gray',
                    })
                    ->icon(fn(string $state): string => match ($state) {
                        Order::DELIVERY_STATUSES['PENDING'] => 'heroicon-o-clock',
                        Order::DELIVERY_STATUSES['PACKING'] => 'heroicon-o-cube',
                        Order::DELIVERY_STATUSES['SHIPPED'] => 'heroicon-o-paper-airplane',
                        Order::DELIVERY_STATUSES['TRANSIT'] => 'heroicon-o-truck',
                        Order::DELIVERY_STATUSES['DELIVERED'] => 'heroicon-o-check-circle',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->action(Action::make('updateDeliveryStatus')
                        ->label('Change Delivery Status')
                        ->schema([
                            Select::make('delivery_status')
                                ->options(array_flip(Order::DELIVERY_STATUSES))
                                ->default(fn($record) => $record->delivery_status)
                        ])
                        ->action(function ($record, $data) {
                            $record->update(['delivery_status' => $data['delivery_status']]);
                            Notification::make()
                                ->title('Delivery status updated!')
                                ->success()
                                ->send();
                        })
                    )
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
//                SelectFilter::make('brand_id')
//                    ->label(__('filament-resources.resources.order.fields.brand_id'))
//                    ->relationship('brand', 'name')
//                    ->searchable()
//                    ->preload(),
//                SelectFilter::make('status')
//                    ->label(__('filament-resources.resources.order.fields.status'))
//                    ->options([
//                        'pending' => 'Pending',
//                        'confirmed' => 'Confirmed',
//                        'processing' => 'Processing',
//                        'completed' => 'Completed',
//                        'cancelled' => 'Cancelled',
//                        'archived' => 'Archived',
//                    ]),
//                SelectFilter::make('delivery_status')
//                    ->label(__('filament-resources.resources.order.fields.delivery_status'))
//                    ->options([
//                        'pending' => 'Pending',
//                        'packing' => 'Packing',
//                        'shipped' => 'Shipped',
//                        'transit' => 'Transit',
//                        'delivered' => 'Delivered',
//                    ]),
//                SelectFilter::make('financial_status')
//                    ->label(__('filament-resources.resources.order.fields.financial_status'))
//                    ->options([
//                        'unpaid' => 'Unpaid',
//                        'paid' => 'Paid',
//                        'partial_paid' => 'Partial paid',
//                        'refunded' => 'Refunded',
//                    ]),
//                Filter::make('has_items')
//                    ->label(__('filament-resources.resources.order.filters.has_items'))
//                    ->query(fn(Builder $query): Builder => $query->has('orderItems')),
//                Filter::make('has_shipping')
//                    ->label(__('filament-resources.resources.order.filters.has_shipping'))
//                    ->query(fn(Builder $query): Builder => $query->has('orderShippings')),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([

            ]);
    }
}
