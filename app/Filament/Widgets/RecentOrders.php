<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\Auth;

class RecentOrders extends BaseWidget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $user = Auth::user();
        $brand = $user?->getBrand();
        $isAdmin = $user?->hasRole(User::ROLES['ADMIN']) ?? false;

        $query = Order::query()
            ->with(['customer', 'brand'])
            ->orderByDesc('created_at')
            ->limit(10);

        if ($brand && !$isAdmin) {
            $query->where('brand_id', $brand->id);
        }

        return $table
            ->heading('Последние заказы')
            ->query($query)
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Номер заказа')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('customer.name')
                    ->label('Покупатель')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Статус')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Ожидает',
                        'confirmed' => 'Подтвержден',
                        'processing' => 'В обработке',
                        'completed' => 'Выполнен',
                        'cancelled' => 'Отменен',
                        'archived' => 'Архив',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'processing' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'archived' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('financial_status')
                    ->label('Оплата')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'unpaid' => 'Не оплачен',
                        'paid' => 'Оплачен',
                        'partial_paid' => 'Частично',
                        'refunded' => 'Возврат',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'unpaid' => 'danger',
                        'paid' => 'success',
                        'partial_paid' => 'warning',
                        'refunded' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Дата')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->recordUrl(fn (Order $record): string => "/admin/orders/{$record->id}")
            ->defaultSort('created_at', 'desc')
            ->paginated(false);
    }
}
