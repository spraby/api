<?php

namespace App\Filament\Resources\Variants\Schemas;

use App\Filament\Actions\Utilities;
use App\Filament\Resources\Images\Schemas\ImageBulkCreateForm;
use App\Models\Image;
use App\Models\Option;
use App\Models\OptionValue;
use App\Models\ProductImage;
use App\Models\Variant;
use App\Models\VariantValue;
use Exception;
use Filament\Actions\Action;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\ImageEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;

class VariantForm
{
    /**
     * @throws Exception
     */
    public static function configure(Schema $schema): Schema
    {

        return $schema
            ->components([
                Grid::make(12)
                    ->columnSpanFull()
                    ->schema([
                        Section::make()
                            ->columnSpan(4)
                            ->schema([
                                ImageEntry::make('image.image.src')
                                    ->extraAttributes(['class' => 'w-full aspect-square'])
                                    ->state(fn(Variant|null $v) => $v?->image?->image?->src ?? null)
                                    ->label('')
                                    ->hiddenLabel()
                                    ->imageHeight('auto')
                                    ->imageWidth('100%'),
                                Grid::make()
                                    ->extraAttributes(['class' => 'flex justify-start gap-1'])
                                    ->schema([
                                        Action::make('select_image')
                                            ->icon(Heroicon::Photo)
                                            ->hiddenLabel()
                                            ->link()
                                            ->modalContent(fn(Variant $v) => view('livewire.image-picker.data', ['product' => $v->product, 'variant' => $v]))
                                            ->modalHeading('Add images')
                                            ->modalSubmitAction(false),
                                        Action::make('upload_image')
                                            ->icon(Heroicon::ArrowUpTray)
                                            ->hiddenLabel()
                                            ->schema(fn(Schema $schema) => ImageBulkCreateForm::configure($schema))
                                            ->modalHeading('Upload images')
                                            ->action(function (array $data, Variant $variant): void {
                                                $position = $variant->product->images()->count();

                                                foreach ($data['src'] as $src) {
                                                    $name = $data['attachment_file_names'][$src];
                                                    /**
                                                     * @var Image $image
                                                     */
                                                    $image = Image::query()->create([
                                                        'src' => $src,
                                                        'name' => $name,
                                                    ]);

                                                    /**
                                                     * @var ProductImage $productImage
                                                     */
                                                    $productImage = $variant->product->images()->create(['image_id' => $image->id, 'position' => $position++]);

                                                    if ($productImage) {
                                                        $variant->image_id = $productImage->id;
                                                        $variant->save();
                                                    }
                                                }
                                            })
                                            ->slideOver()
                                            ->stickyModalHeader()
                                    ])


                            ]),

                        Grid::make()
                            ->columnSpan(8)
                            ->schema([
                                Toggle::make('enabled')
                                    ->required(),

                                TextInput::make('title')
                                    ->readOnly()
                                    ->columnSpanFull(),

                                Grid::make()
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
                                            ->afterStateHydrated(function (Variant|null $variant, Set $set) {
                                                $set('discount', $variant?->discount ?? 0);
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
                                    ])

                            ]),

                        Repeater::make('values')
                            ->label('Variant Options')
                            ->relationship()
                            ->columnSpan(12)
                            ->schema([
                                Select::make('option_id')
                                    ->label('Option')
                                    ->options(function (VariantValue|null $v): Collection {
                                        if (!$v?->variant?->product?->category) return collect();
                                        return $v->variant->product->category->options->pluck('title', 'id');
                                    })
                                    ->disableOptionWhen(function (string $value, string $state, Get $get, VariantValue $v) {
                                        if (!$v->variant?->product?->category) return collect();
                                        $option = $v->variant->product->category->options->firstWhere('id', $value);
                                        return $state !== $value && (!$option->values->count() || !!collect($get('../../values'))
                                                ->first(fn($v) => isset($v['option_id']) && $value === (string)$v['option_id']));
                                    })
                                    ->required()
                                    ->live()
                                    ->default(function (Get $get, VariantValue|null $v) {
                                        if (!$v?->variant?->product?->category) return [];
                                        /**
                                         * @var Option|null $option
                                         */
                                        $option = $v->variant->product->category->options->first(function (Option $o) use ($get) {
                                            return $o->values->count() && !collect($get('../../values'))
                                                    ->first(fn($v) => isset($v['option_id']) && (string)$o->id === (string)$v['option_id']);
                                        });

                                        return $option ? (string)$option->id : null;
                                    })
                                    ->columnSpan(1),

                                Select::make('option_value_id')
                                    ->label('Value')
                                    ->options(function (Get $get, VariantValue|null $v): Collection {
                                        if (!$v?->variant?->product?->category) return collect();

                                        $optionId = $get('option_id');
                                        /** @var Option|null $option */
                                        $option = $optionId ? $v->variant->product->category->options->firstWhere('id', $optionId) : null;
                                        if (!$option) return collect();

                                        return $option->values->pluck('value', 'id');
                                    })
                                    ->required()
                                    ->default(function (Get $get, VariantValue|null $v) {
                                        if (!$v?->variant?->product?->category) return null;

                                        $firstValue = collect($get('../../values'))
                                            ->first(fn($v) => isset($v['option_id']) && !isset($v['option_value_id']));

                                        /**
                                         * @var Option|null $option
                                         */
                                        $option = $firstValue && $firstValue['option_id'] ? $v->variant->product->category->options->firstWhere('id', $firstValue['option_id']) : null;
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
                            ->maxItems(function (Get $get, Variant|null $v): int {
                                if (!$v) return 10000;
                                $usedOptionIds = collect($get('values'))->pluck('option_id')->filter()->all();
                                $optionIds = $v->product->category?->options->filter(fn(Option $o) => $o->values->count())->pluck('id')->all();
                                return count(array_diff($optionIds, $usedOptionIds)) === 0 ? count($optionIds) : 10000;
                            })
                    ]),
            ]);
    }
}
