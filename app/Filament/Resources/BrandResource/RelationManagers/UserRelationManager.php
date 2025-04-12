<?php

namespace App\Filament\Resources\BrandResource\RelationManagers;

use App\Models\User;
use App\Filament\Resources\UserResource;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;

class UserRelationManager extends RelationManager
{
    protected static string $relationship = 'user';

    public function form(Form $form): Form
    {
        $record = $this->getOwnerRecord();

        if ($record->user_id) {
            return $form->schema([
                Forms\Components\Placeholder::make('user_info')
                    ->label('User')
                    ->content(fn () => $record->user?->name . ' (#' . $record->user_id . ')')
                    ->columnSpanFull(),
            ]);
        }

        return $form->schema([
            Forms\Components\Select::make('user_id')
                ->label('User')
                ->options(
                    User::doesntHave('brands')->pluck('name', 'id')
                )
                ->required()
                ->getOptionLabelFromRecordUsing(fn (User $record) => "{$record->name} (#{$record->id})"),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('id'),
                Tables\Columns\TextColumn::make('name')
                    ->label('Name')
                    ->url(fn ($record) => UserResource::getUrl('edit', ['record' => $record]))
                    ->openUrlInNewTab(),
                Tables\Columns\TextColumn::make('email'),
            ])
            ->headerActions([
                Action::make('attachUser')
                    ->label('Attach User')
                    ->icon('heroicon-o-user-plus')
                    ->visible(fn () => $this->getOwnerRecord()->user_id === null)
                    ->form([
                        Forms\Components\Select::make('user_id')
                            ->label('Choose user')
                            ->options(
                                User::doesntHave('brands')->pluck('email', 'id')
                            )
                            ->required(),
                    ])
                    ->action(function (array $data, RelationManager $livewire) {
                        $brand = $livewire->getOwnerRecord();
                        $brand->user()->associate($data['user_id']);
                        $brand->save();

                        Notification::make()
                            ->title('User attached successfully')
                            ->success()
                            ->send();
                    })
                    ->after(fn (RelationManager $livewire) => $livewire->dispatch('refresh')),
            ])
            ->actions([
                Tables\Actions\DetachAction::make()
                    ->visible(fn ($record) => $record?->id !== null)
                    ->action(function (array $data, RelationManager $livewire) {
                        $brand = $livewire->getOwnerRecord();
                        $brand->user()->dissociate();
                        $brand->save();

                        Notification::make()
                            ->title('User dittached successfully')
                            ->success()
                            ->send();
                    })
            ])
            ->bulkActions([]);
    }
}
