<?php

namespace App\Filament\Resources\Variants\Tables;

use App\Filament\Resources\Variants\Schemas\VariantForm;
use App\Models\Brand;
use App\Models\Variant;
use App\Models\VariantValue;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Notifications\Notification;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;

class VariantsTable
{
    /**
     * @throws \Exception
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image.image.src')
                    ->imageWidth(50)
                    ->imageHeight(50),
                TextColumn::make('title')
                    ->state(fn (Variant $v): HtmlString => new HtmlString($v->values->map(fn (VariantValue $value) => "<div><b>{$value->option->title}</b>: {$value->value->value}</div>")->implode('')))
                    ->searchable(),
                TextColumn::make('final_price')
                    ->label('Price')
                    ->state(fn (Variant $v): string => Brand::toMoney($v->final_price))
                    ->description(fn (Variant $v): Htmlable => $v->final_price !== $v->price ? new HtmlString("<s class='text-[10px]'>".Brand::toMoney($v->price)."</s> <span class='text-green-500'>{$v->discount}%</span>") : new HtmlString(''))
                    ->sortable(),
                IconColumn::make('enabled')
                    ->boolean(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                Action::make('edit-variant')
                    ->label('Edit')
                    ->icon(Heroicon::PencilSquare)
                    ->schema(fn (Schema $schema) => VariantForm::configure($schema))
                    ->fillForm(fn (Variant $record) => $record->toArray())
                    ->modalHeading('Edit Variant')
                    ->action(function (array $data, Variant $record): void {
                        $record->update($data);

                        Notification::make()
                            ->title('Variant updated successfully')
                            ->success()
                            ->send();
                    })
                    ->slideOver(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
