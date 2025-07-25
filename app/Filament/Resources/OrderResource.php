<?php

namespace App\Filament\Resources;

use App\Filament\Components\CustomerInfoCard;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use LaraZeus\Popover\Tables\PopoverColumn;

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

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make(__('filament-resources.resources.order.sections.general'))
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label(__('filament-resources.resources.order.fields.name'))
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\Textarea::make('note')
                                    ->label(__('filament-resources.resources.order.fields.note'))
                                    ->maxLength(65535)
                                    ->columnSpanFull(),
                            ]),

                        Forms\Components\Section::make(__('filament-resources.resources.order.sections.status'))
                            ->columns(3)
                            ->schema([
                                Forms\Components\Select::make('status')
                                    ->label(__('filament-resources.resources.order.fields.status'))
                                    ->options([
                                        'pending' => 'Pending',
                                        'confirmed' => 'Confirmed',
                                        'processing' => 'Processing',
                                        'completed' => 'Completed',
                                        'cancelled' => 'Cancelled',
                                        'archived' => 'Archived',
                                    ])
                                    ->required(),
                                Forms\Components\Select::make('delivery_status')
                                    ->label(__('filament-resources.resources.order.fields.delivery_status'))
                                    ->options([
                                        'pending' => 'Pending',
                                        'packing' => 'Packing',
                                        'shipped' => 'Shipped',
                                        'transit' => 'Transit',
                                        'delivered' => 'Delivered',
                                    ])
                                    ->required(),
                                Forms\Components\Select::make('financial_status')
                                    ->label(__('filament-resources.resources.order.fields.financial_status'))
                                    ->options([
                                        'unpaid' => 'Unpaid',
                                        'paid' => 'Paid',
                                        'partial_paid' => 'Partial paid',
                                        'refunded' => 'Refunded',
                                    ])
                                    ->required(),
                            ]),
                    ])
                    ->columnSpan(['lg' => 2]),

                Forms\Components\Group::make()
                    ->schema([
                        CustomerInfoCard::make(__('filament-resources.resources.order.fields.customer_id')),
                        Forms\Components\Section::make(__('filament-resources.resources.order.sections.associations'))
                            ->schema([
                                Forms\Components\Select::make('brand_id')
                                    ->label(__('filament-resources.resources.order.fields.brand_id'))
                                    ->relationship('brand', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->visible(fn() => Auth::user()?->hasRole('admin')),
                            ]),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
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
                Tables\Columns\SelectColumn::make('status')
                    ->label(__('filament-resources.resources.order.fields.status'))
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'archived' => 'Archived',
                    ])
                    ->sortable(),
                Tables\Columns\SelectColumn::make('delivery_status')
                    ->label(__('filament-resources.resources.order.fields.delivery_status'))
                    ->options([
                        'pending' => 'Pending',
                        'packing' => 'Packing',
                        'shipped' => 'Shipped',
                        'transit' => 'Transit',
                        'delivered' => 'Delivered',
                    ])
                    ->sortable(),
                Tables\Columns\SelectColumn::make('financial_status')
                    ->label(__('filament-resources.resources.order.fields.financial_status'))
                    ->options([
                        'unpaid' => 'Unpaid',
                        'paid' => 'Paid',
                        'partial_paid' => 'Partial paid',
                        'refunded' => 'Refunded',
                    ])
                    ->sortable(),


                PopoverColumn::make('orderItems_count')
                    ->label(__('filament-resources.resources.order.fields.items_count'))
                    ->counts('orderItems')
                    ->sortable()
                    ->trigger('click')
                    ->placement('right')
                    ->offset(6)
                    ->icon('heroicon-o-chevron-right')
                    ->label('LineItems')
                    // контент поповера — Blade-вьюха:
                    ->content(function (Order $order) {
                        /**
                         * @var Collection<OrderItem> $orderItems
                         */
                        $orderItems = $order->orderItems()->with('product')->get();

                        if ($orderItems->isEmpty()) {
                            return null;
                        }

                        $items = [];
                        foreach ($orderItems as $item) {
                            $items[] = [
                                'label' => $item->product ? $item->product->title : $item->title,
                                'url' => '/admin/products/' . $item->product_id,
                            ];
                        }

                        return view(
                            'filament.components.order-items-popover',
                            ['items' => $items],
                        );
                    }),


//                Tables\Columns\TextColumn::make('orderItems_count')
//                    ->label(__('filament-resources.resources.order.fields.items_count'))
//                    ->counts('orderItems')
//                    ->sortable()
//                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
//                        /**
//                         * @var Order $order
//                         */
//                        $order = $column->getRecord();
//                        $orderItems = $order->orderItems()->with('product')->get();
//
//                        if ($orderItems->isEmpty()) {
//                            return null;
//                        }
//
//                        $tooltipContent = '';
//                        foreach ($orderItems as $item) {
//                            $productName = $item->product ? $item->product->title : $item->title;
//                            $tooltipContent .= "{$productName} (x{$item->quantity})\n";
//                        }
//
//                        return $tooltipContent;
//                    }),
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
                Tables\Actions\EditAction::make(),
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
            RelationManagers\OrderShippingsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}
