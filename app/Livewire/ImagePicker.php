<?php


namespace App\Livewire;

use App\Models\ProductImage;
use App\Models\Variant;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Image;
use App\Models\Product;
use Filament\Actions\BulkAction;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;
use Livewire\Component;

class ImagePicker extends Component implements HasActions, HasSchemas, HasTable
{
    use InteractsWithActions;
    use InteractsWithSchemas;
    use InteractsWithTable;

    public string $search = '';
    public ?Product $product;
    public ?Variant $variant;

    /**
     * @param Product|null $product
     * @param Variant|null $variant
     * @return void
     */
    public function mount(?Product $product = null, ?Variant $variant = null): void
    {
        $this->product = $product;
        $this->variant = $variant;
    }

    public function table(Table $table): Table
    {
        $imagesIds = $this->product->images()->pluck('image_id')->toArray();

        return $table
            ->query(Image::query()->whereNotIn('id', $imagesIds))
            ->columns([
                Stack::make([
                    ImageColumn::make('url')
                        ->label('Image')
                        ->imageHeight('200px')
                        ->imageWidth('100%')
                        ->square()
                        ->extraImgAttributes([
                            'alt' => 'Image',
                            'loading' => 'lazy',
                        ]),
                    TextColumn::make('name')
                        ->searchable(),
                ])
                    ->space(3),
            ])
            ->filters([
                //
            ])
            ->contentGrid([
                'md' => 3,
            ])
            ->paginated([12, 24, 48, 96])
            ->maxSelectableRecords($this->variant?->id ? 1 : null)
            ->toolbarActions([
                BulkAction::make('attach')
                    ->label('Add selected images')
                    ->icon('heroicon-o-plus')
                    ->action(function (Collection $records) {
                        try {
                            if ($this->variant?->id) {
                                $id = $records->pluck('id')->first();

                                $productImagesNumber = $this->product->images()->count();

                                /**
                                 * @var ProductImage $productImage
                                 */
                                $productImage = $this->product->images()->create(['image_id' => $id, 'position' => $productImagesNumber + 1]);
                                if (!$productImage) throw new \Exception('Image not saved');
                                $this->variant->image_id = $productImage->id;
                                $this->variant->save();
                            } else {
                                $ids = $records->pluck('id')->toArray();

                                foreach ($ids as $id) {
                                    $this->product->images()->create(['image_id' => $id]);
                                }
                            }

                            Notification::make()
                                ->title('Images was added successfully')
                                ->success()
                                ->send();

                            $this->dispatch('close-modal', id: 'edit-profile');
                        } catch (\Exception $e) {
                            Notification::make()
                                ->title('Something went wrong')
                                ->danger();
                        }
                    })
            ]);
    }

    public function render(): View
    {
        return view('livewire.image-picker.view');
    }
}
