<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Filament\Actions\Utilities;
use App\Models\Category;
use App\Models\Option;
use App\Models\OptionValue;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use App\Models\VariantValue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    public function mount($record = null): void
    {
        parent::mount($record);

        if ($record && $record->category === null) {
            Notification::make()
                ->warning('Категория продукта была удалена, опции для вариантов недоступны')
                ->send();
        }
    }

    public function form(Form $form): Form
    {
        /**
         * @var Category|null $category
         * @var Product $product
         */
        $product = $this->ownerRecord;
        $product->load(['category.options.values', 'variants.values']);

        /**
         * @var User $user
         */
        $user = Auth::user();
        $brand = $user->getBrand();

        return $form
            ->schema([
                Forms\Components\Grid::make(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([
                            Forms\Components\TextInput::make('title')
                                ->label(__('filament-resources.resources.product.relations.variants.fields.title'))
                                ->maxLength(255)
                                ->columnSpan(10),
                            Forms\Components\Toggle::make('enabled')
                                ->label(__('filament-resources.resources.product.fields.enabled'))
                                ->default(fn(Variant $variant) => $variant->enabled)
                                ->live()
                                ->afterStateUpdated(function ($state, Variant $variant) {
                                    $variant->enabled = $state;
                                    $variant->save();
                                    Notification::make()
                                        ->title(__('Status changed'))
                                        ->success()
                                        ->send();
                                })
                                ->extraFieldWrapperAttributes(['style' => 'padding-top: 37px'])
                                ->columnSpan(2)
                        ]),

                        Forms\Components\Grid::make(8)
                            ->schema([
                                Forms\Components\TextInput::make('price')
                                    ->default(0)
                                    ->label(__('filament-resources.resources.product.fields.price'))
                                    ->numeric()
                                    ->reactive()
                                    ->columnSpan(3)
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateFinalPrice($get, $set);
                                    }),
                                Forms\Components\TextInput::make('discount')
                                    ->default(0)
                                    ->label('%')
                                    ->dehydrated(false)
                                    ->numeric()
                                    ->reactive()
                                    ->columnSpan(2)
                                    ->afterStateHydrated(function (Variant $variant, Set $set) {
                                        $set('discount', $variant->discount);
                                    })
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateFinalPrice($get, $set);
                                    }),
                                Forms\Components\TextInput::make('final_price')
                                    ->label(__('filament-resources.resources.product.fields.final_price'))
                                    ->default(0)
                                    ->numeric()
                                    ->reactive()
                                    ->columnSpan(3)
                                    ->afterStateUpdated(function (Get $get, Set $set) {
                                        Utilities::updateDiscountValue($get, $set);
                                    }),
                            ]),


                        Forms\Components\Repeater::make('values')
                            ->label('Variant Options')
                            ->relationship()
                            ->columnSpan(12)
                            ->schema([
                                Forms\Components\Select::make('option_id')
                                    ->label('Option')
                                    ->options(function () use ($product): Collection {
                                        if (!$product->category) return collect();
                                        return $product->category->options->pluck('title', 'id');
                                    })
                                    ->disableOptionWhen(function (string $value, Forms\Get $get) use ($product) {
                                        if (!$product->category) return collect();
                                        $option = $product->category->options->firstWhere('id', $value);
                                        return !$option->values->count() || !!collect($get('../../values'))
                                                ->first(fn($v) => isset($v['option_id']) && $value === (string)$v['option_id']);
                                    })
                                    ->required()
                                    ->live()
                                    ->default(function (Forms\Get $get) use ($product) {
                                        if (!$product->category) return [];
                                        /**
                                         * @var Option|null $option
                                         */
                                        $option = $product->category->options->first(function (Option $o) use ($get) {
                                            return $o->values->count() && !collect($get('../../values'))
                                                    ->first(fn($v) => isset($v['option_id']) && (string)$o->id === (string)$v['option_id']);
                                        });

                                        return $option ? (string)$option->id : null;
                                    })
                                    ->columnSpan(1),


                                Forms\Components\Select::make('option_value_id')
                                    ->label('Value')
                                    ->options(function (Forms\Get $get) use ($product): Collection {
                                        if (!$product->category) return collect();

                                        $optionId = $get('option_id');
                                        /** @var Option|null $option */
                                        $option = $optionId ? $product->category->options->firstWhere('id', $optionId) : null;
                                        if (!$option) return collect();

                                        return $option->values->pluck('value', 'id');
                                    })
                                    ->required()
                                    ->default(function (Forms\Get $get) use ($product) {
                                        if (!$product->category) return null;

                                        $firstValue = collect($get('../../values'))
                                            ->first(fn($v) => isset($v['option_id']) && !isset($v['option_value_id']));

                                        /**
                                         * @var Option|null $option
                                         */
                                        $option = $firstValue && $firstValue['option_id'] ? $product->category->options->firstWhere('id', $firstValue['option_id']) : null;
                                        if (!$option) return null;

                                        $optionUsedValueIds = collect($get('../../values'))
                                            ->filter(fn($value) => (string)$option->id === (string)$value['option_id'])
                                            ->pluck('option_value_id')
                                            ->filter()
                                            ->all();

                                        /**
                                         * @var OptionValue|null $availableValue
                                         */
                                        $availableValue = $option->values
                                            ->whereNotIn('id', $optionUsedValueIds)
                                            ->first();

                                        return $availableValue?->id;
                                    })
                                    ->searchable()
                                    ->columnSpan(1),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add combination')
                            ->maxItems(function (Forms\Get $get) use ($product): int {
                                $usedOptionIds = collect($get('values'))->pluck('option_id')->filter()->all();
                                $optionIds = $product->category?->options->filter(fn(Option $o) => $o->values->count())->pluck('id')->all();
                                return count(array_diff($optionIds, $usedOptionIds)) === 0 ? count($optionIds) : 10000;
                            })
                            ->hidden(fn(Forms\Get $get) => !$get('product_id')),


                    ]),


//                Forms\Components\Select::make('image_id')
//                    ->label('Image')
//                    ->preload()
//                    ->options(function (RelationManager $livewire) {
//                        /**
//                         * @var Product $product
//                         */
//                        $product = $livewire->ownerRecord;
//
//                        return $product->images->mapWithKeys(function ($img) {
//                            return [
//                                $img->pivot_id => <<<HTML
//                                    <div class="flex items-center gap-2">
//                                        <img src="{$img->url}" class="h-16 w-16 rounded object-cover" alt="">
//                                        <span>{$img->name}</span>
//                                    </div>
//                                HTML,
//                            ];
//                        });
//                    })
//                    ->searchable()
//                    ->allowHtml()
//                    ->nullable(),


            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image.src')
                    ->disk('s3')
                    ->label('Preview')
                    ->height(120),
                Tables\Columns\TextColumn::make('title')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.title'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_price')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.final_price'))
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('values_count')
                    ->label(__('filament-resources.resources.product.relations.variants.fields.values_count'))
                    ->counts('values')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
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
}
