<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\Resources\Images\Schemas\ImageBulkCreateForm;
use App\Filament\Resources\Images\Schemas\ImageForm;
use App\Filament\Resources\ProductImages\ProductImageResource;
use App\Filament\Resources\Variants\Schemas\VariantForm;
use App\Models\Image;
use App\Models\Product;
use App\Models\Variant;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

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
                    ->label('Add image')
                    ->icon('heroicon-o-plus')
                    ->modalContent(view('livewire.image-picker.data', compact('product')))
                    ->modalHeading('Add images')
                    ->modalSubmitAction(false),

                Action::make('create')
                    ->label('Upload images')
                    ->icon(Heroicon::PencilSquare)
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
