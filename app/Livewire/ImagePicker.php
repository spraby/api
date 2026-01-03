<?php

namespace App\Livewire;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Variant;
use Filament\Actions\BulkAction;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Notifications\Notification;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class ImagePicker extends Component implements HasActions, HasSchemas, HasTable
{
    use InteractsWithActions;
    use InteractsWithSchemas;
    use InteractsWithTable;

    public string $search = '';

    public ?Product $product;

    public ?Variant $variant;

    public function mount(?Product $product = null, ?Variant $variant = null): void
    {
        $this->product = $product;
        $this->variant = $variant;
    }

    public function table(Table $table): Table
    {
        $imagesIds = $this->product->images()->pluck('image_id')->unique()->toArray();

        if ($this->variant?->image?->image_id && in_array($this->variant->image->image_id, $imagesIds)) {
            unset($imagesIds[array_search($this->variant->image->image_id, $imagesIds)]);
        }

        /**
         * @var User $user
         */
        $user = Auth::user();
        $brand = $user->getBrand();

        return $table
            ->query(fn () => $brand?->images()->when((bool) $this->variant?->id, fn ($q) => $q->whereIn('id', $imagesIds), fn ($q) => $q->whereNotIn('id', $imagesIds)))
            ->columns([
                Stack::make([
                    ImageColumn::make('url')
                        ->label('Image')
                        ->imageHeight('185px')
                        ->imageWidth('185px')
                        ->extraImgAttributes([
                            'class' => 'rounded-md',
                            'alt' => 'Image',
                            'loading' => 'lazy',
                        ]),
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
                    ->action(function (Collection $records): void {
                        try {
                            if ($this->variant?->id) {
                                $id = $records->pluck('id')->first();
                                if ($id) {
                                    $productImage = ProductImage::where('image_id', $id)->where('product_id', $this->product->id)->first();
                                    if ($productImage) {
                                        $this->variant->image_id = $productImage->id;
                                        $this->variant->save();
                                    }

                                }
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
                    }),
            ]);
    }

    public function render(): View
    {
        return view('livewire.image-picker.view');
    }
}
