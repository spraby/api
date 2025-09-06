<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\Components\Form\Banner;
use App\Filament\Resources\Products\Schemas\VariantCreateForm;
use App\Filament\Resources\Variants\Schemas\VariantForm;
use App\Filament\Resources\Variants\VariantResource;
use App\Models\Option;
use App\Models\OptionValue;
use App\Models\Product;
use App\Models\Variant;
use App\Models\VariantValue;
use Exception;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Collection;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $relatedResource = VariantResource::class;

    public function table(Table $table): Table
    {

        /**
         * @var Product $product
         */
        $product = $this->getOwnerRecord();

        return $table
            ->headerActions([
                Action::make('add-variant')
                    ->label('Add variant')
                    ->schema(fn(Schema $schema) => $this->createForm($schema))
                    ->modalHeading('Add Variant')
                    ->action(function (array $data) use ($product): void {

                        $values = collect($data['values']);
                        $optionValueIds = $values->pluck('option_value_id')->filter()->all();
                        $optionValues = OptionValue::query()->whereIn('id', $optionValueIds)->get();;

                        $title = [];

                        foreach ($values as $value) {
                            /**
                             * @var OptionValue $optionValue
                             */
                            $optionValue = $optionValues->firstWhere('id', $value['option_value_id']);
                            $title[] = $optionValue->value;
                        }

                        /**
                         * @var Variant $variant
                         */
                        $variant = Variant::query()->create([
                            'product_id' => $product->id,
                            'title' => implode('|', $title),
                            'price' => $product->price,
                            'final_price' => $product->final_price,
                        ]);

                        foreach ($data['values'] as $value) {
                            VariantValue::create([
                                'variant_id' => $variant->id,
                                'option_id' => $value['option_id'],
                                'option_value_id' => $value['option_value_id'],
                            ]);
                        }
                    })
                    ->slideOver()

            ]);
    }

    /**
     * @param Schema $schema
     * @return Schema
     * @throws Exception
     */
    public function createForm(Schema $schema): Schema
    {
        /**
         * @var Product $product
         */
        $product = $this->getOwnerRecord();
        return $schema
            ->components([
                Banner::make('ddd')
                    ->columnSpan(12)
                    ->label('test')
                    ->setHeader('Ваш продукт не имеет категорий. Создание вариантов продукта невозможно')
                    ->setType('warning')
                    ->hidden(fn() => !!$product->category),

                Repeater::make('values')
                    ->label('Variant Options')
                    ->columnSpan(12)
                    ->hidden(fn() => !$product->category)
                    ->schema([
                        Select::make('option_id')
                            ->label('Option')
                            ->options(function () use ($product): Collection {
                                if (!$product?->category) return collect();
                                return $product->category->options->pluck('title', 'id');
                            })
                            ->disableOptionWhen(function (string $value, string $state, Get $get) use ($product) {
                                if (!$product?->category) return collect();
                                $option = $product->category->options->firstWhere('id', $value);

                                return $state !== $value && (!$option->values->count() || !!collect($get('../../values'))
                                            ->first(fn($v) => isset($v['option_id']) && $value === (string)$v['option_id']));
                            })
                            ->required()
                            ->live()
                            ->default(function (Get $get) use ($product) {
                                if (!$product?->category) return collect();

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


                        Select::make('option_value_id')
                            ->label('Value')
                            ->options(function (Get $get) use ($product): Collection {
                                if (!$product?->category) return collect();

                                $optionId = $get('option_id');
                                /** @var Option|null $option */
                                $option = $optionId ? $product->category->options->firstWhere('id', $optionId) : null;
                                if (!$option) return collect();

                                return $option->values->pluck('value', 'id');
                            })
                            ->required()
                            ->default(function (Get $get) use ($product) {
                                if (!$product?->category) return null;

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
                    ->maxItems(function (Get $get) use ($product): int {
                        if (!$product->category) return 0;
                        $usedOptionIds = collect($get('values'))->pluck('option_id')->filter()->all();
                        $optionIds = $product->category?->options->filter(fn(Option $o) => $o->values->count())->pluck('id')->all();
                        if ($optionIds === null) return 0;
                        return count(array_diff($optionIds, $usedOptionIds)) === 0 ? count($optionIds) : 10000;
                    })

            ]);
    }

}
