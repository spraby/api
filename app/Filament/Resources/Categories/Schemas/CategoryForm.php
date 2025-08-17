<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\RichEditor;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class CategoryForm
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
                                Select::make('options')
                                    ->relationship('options', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->columnSpanFull(),
                            ])
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
                    ->columnSpanFull()
            ]);
    }
}
