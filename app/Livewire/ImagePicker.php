<?php


namespace App\Livewire;

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
    public Product $product;

    public function mount(?Product $product = null): void
    {
        $this->product = $product;
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
            ->paginated([
                20,
                40,
                80,
                'all',
            ])
            ->toolbarActions([
                BulkAction::make('attach')
                    ->label('Add selected images')
                    ->icon('heroicon-o-plus')
                    ->action(function (Collection $records) {

                        try {
                            $ids = $records->pluck('id')->toArray();

                            foreach ($ids as $id) {
                                $productImage = $this->product->images()->where('image_id', $id)->first();
                                if (!$productImage) {
                                    $lastPosition = $this->product->images()->max('position') ?? 0;

                                    $this->product->images()->create([
                                        'image_id' => $id,
                                        'position' => $lastPosition
                                    ]);
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
