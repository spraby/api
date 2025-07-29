<?php

namespace App\Filament\Resources;

use App\Filament\Components\CustomerInfoCard;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Infolists\Components\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use LaraZeus\Popover\Tables\PopoverColumn;

/**
 *
 */
class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';

    protected static ?string $navigationGroup = 'Shop';

    protected static ?int $navigationSort = 3;

    public static function getModelLabel(): string
    {
        return __('filament-resources.resources.order.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.resources.order.plural_label');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament-resources.resources.order.navigation_label');
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        /**
         * @var User $user
         */
        $user = Auth::user();

        if ($user?->hasRole('admin')) return $query;

        $brand = $user->getBrand();

        return $query->when($brand, function (Builder $r) use ($brand) {
            $r->where('brand_id', $brand->id);
        });
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label(__('filament-resources.resources.order.fields.name'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.name')
                    ->label(__('filament-resources.resources.order.fields.customer_id'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
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
                    })
                    ->icon(fn(string $state): string => match ($state) {
                        Order::STATUSES['PENDING'] => 'heroicon-o-clock',
                        Order::STATUSES['CONFIRMED'] => 'heroicon-o-document-check',
                        Order::STATUSES['PROCESSING'] => 'heroicon-o-arrow-path',
                        Order::STATUSES['COMPLETED'] => 'heroicon-o-check-badge',
                        Order::STATUSES['CANCELLED'] => 'heroicon-o-x-circle',
                        Order::STATUSES['ARCHIVED'] => 'heroicon-o-archive-box',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->action(Tables\Actions\Action::make('updateStatus')
                        ->label('Change Status')
                        ->form([
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
                Tables\Columns\TextColumn::make('financial_status')
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
                    ->action(Tables\Actions\Action::make('updateFinancialStatus')
                        ->label('Change Financial Status')
                        ->form([
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
                Tables\Columns\TextColumn::make('delivery_status')
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
                    ->action(Tables\Actions\Action::make('updateDeliveryStatus')
                        ->label('Change Delivery Status')
                        ->form([
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
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.order.fields.created_at'))
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('filament-resources.resources.order.fields.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('brand_id')
                    ->label(__('filament-resources.resources.order.fields.brand_id'))
                    ->relationship('brand', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('status')
                    ->label(__('filament-resources.resources.order.fields.status'))
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'archived' => 'Archived',
                    ]),
                Tables\Filters\SelectFilter::make('delivery_status')
                    ->label(__('filament-resources.resources.order.fields.delivery_status'))
                    ->options([
                        'pending' => 'Pending',
                        'packing' => 'Packing',
                        'shipped' => 'Shipped',
                        'transit' => 'Transit',
                        'delivered' => 'Delivered',
                    ]),
                Tables\Filters\SelectFilter::make('financial_status')
                    ->label(__('filament-resources.resources.order.fields.financial_status'))
                    ->options([
                        'unpaid' => 'Unpaid',
                        'paid' => 'Paid',
                        'partial_paid' => 'Partial paid',
                        'refunded' => 'Refunded',
                    ]),
                Tables\Filters\Filter::make('has_items')
                    ->label(__('filament-resources.resources.order.filters.has_items'))
                    ->query(fn(Builder $query): Builder => $query->has('orderItems')),
                Tables\Filters\Filter::make('has_shipping')
                    ->label(__('filament-resources.resources.order.filters.has_shipping'))
                    ->query(fn(Builder $query): Builder => $query->has('orderShippings')),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            RelationManagers\OrderItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
//            'edit' => Pages\EditOrder::route('/{record}/edit'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}
