<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ImageResource\Pages;
use App\Filament\Resources\ImageResource\RelationManagers;
use App\Models\Image;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Storage;

class ImageResource extends Resource
{
    protected static ?string $model = Image::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
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

//                Forms\Components\FileUpload::make('src')
//                    ->label('Image')
//                    ->image()
//                    ->imageEditor()
//                    ->disk('s3')
//                    ->directory('uploads')
//                    ->visibility('public')
//                    ->storeFiles()
//                    ->required()
//                    ->rules(['max:5120']) // 5MB
//                    ->deleteUploadedFileUsing(fn ($filePath) => Storage::disk('s3')->delete($filePath)),


                Forms\Components\TextInput::make('alt')
                    ->label('Alt')
                    ->maxLength(255),

                Forms\Components\Textarea::make('meta')
                    ->label('Meta'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('src')
                    ->disk('s3')
                    ->label('Preview')
                    ->height(80),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListImages::route('/'),
            'create' => Pages\CreateImage::route('/create'),
            'edit' => Pages\EditImage::route('/{record}/edit'),
        ];
    }
}
