<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Filament\Actions\Utilities;
use App\Models\Product;
use Exception;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\ImageEntry;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;

class ProductForm
{
    /**
     * @throws Exception
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(12)
            ->components([

                Grid::make()
                    ->columnSpan(8)
                    ->schema([
                        Section::make(__('filament-resources.resources.product.sections.general'))
                            ->columnSpanFull()
                            ->schema([
                                TextInput::make('title')
                                    ->columnSpanFull()
                                    ->required(),
                                RichEditor::make('description')
                                    ->columnSpanFull()
                                    ->toolbarButtons([
                                        'bold',
                                        'italic',
                                        'underline',
                                        'strike',
                                        'orderedList',
                                        'bulletList',
                                        'undo',
                                        'redo',
                                    ])
                                    ->label(__('filament-resources.resources.product.fields.description'))
                                    ->maxLength(65535)
                                    ->columnSpanFull(),
                            ]),

                        Section::make(__('filament-resources.resources.product.sections.pricing'))
                            ->columns(3)
                            ->columnSpanFull()
                            ->schema([
                                TextInput::make('price')
                                    ->default(0)
                                    ->label(__('filament-resources.resources.product.fields.price'))
                                    ->numeric()
                                    ->reactive()
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateFinalPrice($get, $set);
                                    }),
                                TextInput::make('discount')
                                    ->default(0)
                                    ->label('%')
                                    ->dehydrated(false)
                                    ->numeric()
                                    ->reactive()
                                    ->afterStateHydrated(function (Product|null $product, Set $set) {
                                        $set('discount', $product?->discount ?? 0);
                                    })
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateFinalPrice($get, $set);
                                    }),
                                TextInput::make('final_price')
                                    ->label(__('filament-resources.resources.product.fields.final_price'))
                                    ->default(0)
                                    ->numeric()
                                    ->reactive()
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateDiscountValue($get, $set);
                                    }),
                            ]),
                    ]),

                Grid::make()
                    ->columnSpan(4)
                    ->schema([
                        Section::make()
                            ->columnSpanFull()
                            ->schema([
                                ImageEntry::make('main_image.image.src')
                                    ->label('')
                                    ->state(fn(Product|null $p) => $p?->mainImage->image->src ?? null)
                                    ->hiddenLabel()
                                    ->default(fn() => 'https://ncpi.tj/wp-content/uploads/2019/07/no_image.jpg')
                                    ->lazy()
                                    ->imageHeight('auto')
                                    ->imageWidth('100%'),
                            ]),
                        Section::make(__('filament-resources.resources.product.sections.status'))
                            ->columnSpanFull()
                            ->schema([
                                Toggle::make('enabled')
                                    ->label(__('filament-resources.resources.product.fields.enabled'))
                                    ->default(fn(Product|null $p) => $p?->enabled ?? true)
                                    ->live()
                                    ->afterStateUpdated(function ($state, Product|null $p) {
                                        if (!$p) return;
                                        $p->enabled = $state;
                                        $p->save();
                                        Notification::make()
                                            ->title(__('Status changed'))
                                            ->success()
                                            ->send();
                                    })
                            ]),

                        Section::make('Category')
                            ->columnSpanFull()
                            ->schema([
                                Select::make('category_id')
                                    ->label(__('filament-resources.resources.product.fields.category_id'))
                                    ->relationship('category', 'name', fn(Product|null $p) => $p?->brand->categories())
                                    ->searchable()
                                    ->preload(),
                            ]),
                    ])
            ]);
    }
}
