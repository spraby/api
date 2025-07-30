<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\HtmlString;

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
         * @var User $user
         */
        $user = Auth::user();
        $brand = $user->getBrand();

        return $form
            ->schema([
                Forms\Components\Grid::make(2)
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
                        Forms\Components\TextInput::make('price')
                            ->label(__('filament-resources.resources.product.relations.variants.fields.price'))
                            ->default(fn(RelationManager $livewire) => $livewire->getOwnerRecord()->price)
                            ->numeric(),
                        Forms\Components\TextInput::make('final_price')
                            ->label(__('filament-resources.resources.product.relations.variants.fields.final_price'))
                            ->default(fn(RelationManager $livewire) => $livewire->getOwnerRecord()->final_price)
                            ->numeric(),
                    ]),
                Forms\Components\Select::make('image_id')
                    ->label('Image')
                    ->preload()
                    ->options(function (RelationManager $livewire) {
                        /**
                         * @var Product $product
                         */
                        $product = $livewire->ownerRecord;

                        return $product->images->mapWithKeys(function ($img) {
                            return [
                                $img->pivot_id => <<<HTML
                                    <div class="flex items-center gap-2">
                                        <img src="{$img->url}" class="h-16 w-16 rounded object-cover" alt="">
                                        <span>{$img->name}</span>
                                    </div>
                                HTML,
                            ];
                        });
                    })
                    ->searchable()
                    ->allowHtml()
                    ->nullable(),
                Forms\Components\Section::make(__('filament-resources.resources.product.relations.variants.sections.options'))
                    ->schema([
                        Forms\Components\Repeater::make('values')
                            ->label(__('filament-resources.resources.product.relations.variants.fields.values'))
                            ->relationship()
                            ->reorderable('product_images.position')
                            ->helperText(fn() => $this->ownerRecord->category === null
                                ? 'Категория удалена, поэтому опции недоступны'
                                : null)
                            ->schema([
                                Forms\Components\Select::make('option_id')
                                    ->label(__('filament-resources.resources.product.relations.variants.fields.option_id'))
                                    ->options(function () {
                                        $category = $this->ownerRecord->category;
                                        return $category ? $category->options->pluck('name', 'id')->toArray() : [];
                                    })
                                    ->required()
                                    ->reactive()
                                    ->disabled(fn() => !$this->ownerRecord->category)
                                    ->afterStateHydrated(function ($state, callable $set) {
                                        if ($this->ownerRecord->category === null) {
                                            $set('option_id', null);
                                        }
                                    })
                                    ->afterStateUpdated(fn($state, callable $set) => $set('option_value_id', null))
                                    ->searchable()
                                    ->preload()
                                    ->helperText(fn() => $this->ownerRecord->category === null
                                        ? new HtmlString(
                                            '<span class="flex items-center text-danger-600 dark:text-danger-400">' .
                                            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">' .
                                            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0V7zm0 6a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V13z" clip-rule="evenodd"/>' .
                                            '</svg>' .
                                            'Категория удалена, поэтому опции недоступны' .
                                            '</span>'
                                        )
                                        : null),
                                Forms\Components\Select::make('option_value_id')
                                    ->label(__('filament-resources.resources.product.relations.variants.fields.option_value_id'))
                                    ->options(function (callable $get) {
                                        $product = $this->ownerRecord;
                                        $category = $product->category;
                                        $optionId = $get('option_id') ?? null;

                                        if (!$category || !$optionId) {
                                            return [];
                                        }

                                        return $category
                                            ->options
                                            ->firstWhere('id', $optionId)
                                            ->values
                                            ->pluck('value', 'id')
                                            ->toArray();
                                    })
                                    ->required()
                                    ->reactive()
                                    ->disabled(fn() => !$this->ownerRecord->category)
                                    ->afterStateHydrated(function ($state, callable $set) {
                                        if ($this->ownerRecord->category === null || !$state) {
                                            $set('option_value_id', null);
                                        }
                                    })
                                    ->searchable()
                                    ->preload()
                                    ->placeholder('–')
                            ])
                            ->columns(2)
                            ->defaultItems(0),
                    ])
                    ->columnSpanFull(),
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
