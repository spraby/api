<?php
namespace App\Filament\Tables;

use Filament\Support\Contracts\TranslatableContentDriver;
use Filament\Tables;
use Filament\Tables\Table;
use Livewire\Component;
use App\Models\ProductImage;

class ProductImageTable extends Component implements Tables\Contracts\HasTable
{
    use Tables\Concerns\InteractsWithTable;


    public function table(Table $table): Table
    {
        return $table
            ->query(ProductImage::query())
            ->columns([
                Tables\Columns\ImageColumn::make('url')->label('Preview'),
                Tables\Columns\TextColumn::make('created_at')->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public function render()
    {
        return view('filament.tables.product-image-table');
    }

    public function makeFilamentTranslatableContentDriver(): ?TranslatableContentDriver
    {
        // TODO: Implement makeFilamentTranslatableContentDriver() method.
    }
}
