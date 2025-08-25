<?php

namespace App\Filament\Resources\Products\Tables;

use App\Filament\Resources\Variants\Schemas\VariantForm;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Variant;
use Exception;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;

class ProductsTable
{
    /**
     * @throws Exception
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('main_image.image.src')
                    ->label('Image')
                    ->imageHeight(50)
                    ->imageWidth(50)
                    ->extraImgAttributes([
                        'alt' => 'Image',
                        'loading' => 'lazy',
                    ]),

                TextColumn::make('title')
                    ->copyable()
                    ->description(fn(Product $p): Htmlable => new HtmlString("<a class='flex gap-[2px] items-center' href='{$p->externalUrl}' target='_blank'>Preview" . ProductsTable::getHeroIconPreview() . "</a><div class='text-gray-400 text-[10px]'>{$p?->category?->name}<span/>"))
                    ->searchable(),

                TextColumn::make('final_price')
                    ->label('Price')
                    ->state(fn(Product $p): string => Brand::toMoney($p->final_price))
                    ->description(fn(Product $p): Htmlable => $p->final_price !== $p->price ? new HtmlString("<s class='text-[10px]'>" . Brand::toMoney($p->final_price) . "</s> <span class='text-green-500'>{$p->discount}%</span>") : new HtmlString(''))
                    ->sortable(),

                IconColumn::make('enabled')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    /**
     * @return string
     */
    private static function getHeroIconPreview(): string
    {
        return '<svg class="fi-icon fi-size-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
      <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z"></path>
      <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z"></path>
    </svg>';
    }
}
