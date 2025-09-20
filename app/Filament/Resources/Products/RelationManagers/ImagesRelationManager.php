<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\Resources\Images\Schemas\ImageBulkCreateForm;
use App\Filament\Resources\ProductImages\ProductImageResource;
use App\Models\Image;
use App\Models\Product;
use App\Models\Variant;
use Filament\Actions\Action;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    protected static ?string $title = 'Images';

    protected static ?string $relatedResource = ProductImageResource::class;

    public function table(Table $table): Table
    {
        /**
         * @var Product $product
         */
        $product = $this->getOwnerRecord();

        return $table
            ->heading('')
            ->headerActions([])
            ->headerActions([
                Action::make('add')
                    ->label('Add from media')
                    ->icon(Heroicon::Plus)
                    ->modalContent(view('livewire.image-picker.data', ['product' => $product, 'variant' => new Variant()]))
                    ->modalHeading('Add images')
                    ->modalSubmitAction(false),

                Action::make('create')
                    ->label('Upload new')
                    ->icon(Heroicon::ArrowUpTray)
                    ->schema(fn(Schema $schema) => ImageBulkCreateForm::configure($schema))
                    ->modalHeading('Upload images')
                    ->action(function (array $data) use ($product): void {
                        $position = $product->images()->count();

                        foreach ($data['src'] as $src) {
                            $name = $data['attachment_file_names'][$src];
                            /**
                             * @var Image $image
                             */
                            $image = Image::query()->create([
                                'src' => $src,
                                'name' => $name,
                            ]);

                            $product->images()->create(['image_id' => $image->id, 'position' => $position++]);
                        }
                    })
                    ->modalWidth('100%')
                    ->slideOver()
                    ->stickyModalHeader()
            ])
            ->toolbarActions([
                DeleteBulkAction::make(),
            ]);
    }
}
