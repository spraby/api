<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Filament\Components\CustomerInfoCard;
use App\Filament\Components\OrderItemsList;
use App\Filament\Components\OrderTimeLineCard;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderInfolist
{
    /**
     * @throws \Exception
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(12)
            ->components([
                Group::make()
                    ->columnSpan(8)
                    ->schema([
                        Section::make()
                            ->columns()
                            ->schema([
                                TextEntry::make('name')
                                    ->copyable()
                                    ->icon('heroicon-o-square-2-stack')
                                    ->iconPosition('after'),

                                TextEntry::make('view')
                                    ->state('View status page')
                                    ->hiddenLabel()
                                    ->url(fn (Order $o) => $o->status_url, true)
                                    ->icon('polaris-external-icon')
                                    ->iconPosition('after')
                                    ->alignEnd(),

                                TextEntry::make('note')
                                    ->columnSpan(2)
                                    ->copyable()
                                    ->icon('heroicon-o-square-2-stack')
                                    ->iconPosition('after'),
                            ]),
                        Section::make()
                            ->heading('Status')
                            ->columns(3)
                            ->schema([
                                TextEntry::make('status')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        Order::STATUSES['PENDING'] => 'gray',
                                        Order::STATUSES['CONFIRMED'] => 'info',
                                        Order::STATUSES['PROCESSING'] => 'warning',
                                        Order::STATUSES['COMPLETED'] => 'success',
                                        Order::STATUSES['CANCELLED'] => 'danger',
                                        Order::STATUSES['ARCHIVED'] => 'slate',
                                        default => 'gray',
                                    })
                                    ->icon(fn (string $state): string => match ($state) {
                                        Order::STATUSES['PENDING'] => 'heroicon-o-clock',
                                        Order::STATUSES['CONFIRMED'] => 'heroicon-o-document-check',
                                        Order::STATUSES['PROCESSING'] => 'heroicon-o-arrow-path',
                                        Order::STATUSES['COMPLETED'] => 'heroicon-o-check-badge',
                                        Order::STATUSES['CANCELLED'] => 'heroicon-o-x-circle',
                                        Order::STATUSES['ARCHIVED'] => 'heroicon-o-archive-box',
                                        default => 'heroicon-o-question-mark-circle',
                                    })
                                    ->action(Action::make('updateStatus')
                                        ->label('Change Status')
                                        ->schema([
                                            Select::make('status')
                                                ->options(array_flip(Order::STATUSES))
                                                ->default(fn ($record) => $record->status),
                                        ])
                                        ->action(function ($record, $data) {
                                            $record->update(['status' => $data['status']]);
                                            Notification::make()
                                                ->title('Status updated!')
                                                ->success()
                                                ->send();
                                        })
                                    ),

                                TextEntry::make('financial_status')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        Order::FINANCIAL_STATUSES['UNPAID'] => 'danger',
                                        Order::FINANCIAL_STATUSES['PAID'] => 'success',
                                        Order::FINANCIAL_STATUSES['PARTIAL_PAID'] => 'warning',
                                        Order::FINANCIAL_STATUSES['REFUNDED'] => 'slate',
                                        default => 'gray',
                                    })
                                    ->icon(fn (string $state): string => match ($state) {
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
                                                ->default(fn ($record) => $record->financial_status),
                                        ])
                                        ->action(function ($record, $data) {
                                            $record->update(['financial_status' => $data['financial_status']]);
                                            Notification::make()
                                                ->title('Financial status updated!')
                                                ->success()
                                                ->send();
                                        })
                                    ),

                                TextEntry::make('delivery_status')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        Order::DELIVERY_STATUSES['PENDING'] => 'gray',
                                        Order::DELIVERY_STATUSES['PACKING'] => 'blue',
                                        Order::DELIVERY_STATUSES['SHIPPED'] => 'info',
                                        Order::DELIVERY_STATUSES['TRANSIT'] => 'warning',
                                        Order::DELIVERY_STATUSES['DELIVERED'] => 'success',
                                        default => 'gray',
                                    })
                                    ->icon(fn (string $state): string => match ($state) {
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
                                                ->default(fn ($record) => $record->delivery_status),
                                        ])
                                        ->action(function ($record, $data) {
                                            $record->update(['delivery_status' => $data['delivery_status']]);
                                            Notification::make()
                                                ->title('Delivery status updated!')
                                                ->success()
                                                ->send();
                                        })
                                    ),

                            ]),
                        Section::make()
                            ->heading('LineItems')
                            ->schema([
                                OrderItemsList::make('lineItems'),
                            ]),

                        Section::make()
                            ->heading('Timeline')
                            ->schema([
                                OrderTimeLineCard::make('timeline'),
                            ]),
                    ]),

                Group::make()
                    ->columnSpan(4)
                    ->schema([
                        Section::make()
                            ->schema([
                                CustomerInfoCard::make(__('filament-resources.resources.order.fields.customer_id')),
                            ]),
                    ]),
            ]);
    }
}
