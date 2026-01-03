<?php

namespace App\Filament\Resources\Collections\Schemas;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class CollectionForm
{
    /**
     * @throws \Exception
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([

                Grid::make()
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(1)
                            ->schema([
                                TextInput::make('name')
                                    ->required(),
                                TextInput::make('title')
                                    ->required(),
                                TextInput::make('header'),
                                TextInput::make('handle')
                                    ->required(),

                            ]),
                        Grid::make(1)
                            ->schema([
                                Select::make('categories')
                                    ->relationship('categories', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->columnSpanFull(),
                            ]),
                    ]),

                RichEditor::make('description')
                    ->maxLength(65535)
                    ->toolbarButtons([
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'h2',
                        'h3',
                        'bulletList',
                        'orderedList',
                        'undo',
                        'redo',
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
