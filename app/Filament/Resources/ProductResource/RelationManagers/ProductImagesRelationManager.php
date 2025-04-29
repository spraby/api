<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Filament\Components\ImagePicker;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProductImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Name')
                    ->required()
                    ->maxLength(255),

                Forms\Components\FileUpload::make('src')
                    ->disk('s3')
                    ->imageEditor()
                    ->directory('form-attachments')
                    ->visibility('private'),

                Forms\Components\TextInput::make('alt')
                    ->label('Alt')
                    ->maxLength(255),

                Forms\Components\Textarea::make('meta')
                    ->label('Meta'),

                Forms\Components\TextInput::make('position')
                    ->label(__('filament-resources.resources.product.relations.images.fields.position'))
                    ->integer()
                    ->default(0)
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('product_images.position')
            ->columns([
                Tables\Columns\ImageColumn::make('src')
                    ->disk('s3')
                    ->label(__('filament-resources.resources.product.relations.images.fields.preview'))
                    ->height(120),
                Tables\Columns\TextColumn::make('name')
                    ->label(__('filament-resources.resources.product.relations.images.fields.name'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('alt')
                    ->label(__('filament-resources.resources.product.relations.images.fields.alt'))
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('position')
                    ->label(__('filament-resources.resources.product.relations.images.fields.position'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament-resources.resources.product.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
                Tables\Actions\AttachAction::make('attachImage')
                    ->label('Add image')
                    ->modalHeading('Choose image')
                    ->form(function (ProductImagesRelationManager $livewire){
                        /**
                         * @var Product $product
                         */
                        $product = $livewire->getOwnerRecord();
                        $images = $product->brand->images()->whereDoesntHave('products', function (Builder $query) use ($product){
                            $query->where('products.id', $product->id);
                        })->get();

                        return [
                            ImagePicker::make('image')->images($images)
                        ];
                    })
                    ->action(function (
                        ProductImagesRelationManager $livewire,
                        array $data,
                    ): void {
                        /**
                         * @var Product $product
                         */
                        $product = $livewire->getOwnerRecord();
                        $product->images()->syncWithoutDetaching($data['image']);
                    })
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DetachAction::make(),
            ])
            ->defaultSort('position');
    }
}
