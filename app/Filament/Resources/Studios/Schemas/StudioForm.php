<?php

namespace App\Filament\Resources\Studios\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;

class StudioForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(1)->schema([
                    Section::make('Informasi Studio')->schema([
                        TextInput::make('name')
                            ->label('Nama Studio')
                            ->placeholder('Contoh: Studio 1, IMAX, The Premiere...')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('capacity')
                            ->label('Kapasitas Ruangan')
                            ->required()
                            ->numeric()
                            ->minValue(1) // Nggak boleh minus dong kapasitasnya
                            ->suffix('Kursi'), // Tambahan visual di kanan input
                    ])->columns(2), // Dibagi 2 biar sebelahan (Kiri Nama, Kanan Kapasitas)
                ])->columnSpan('md'), // Kita batasi lebarnya ke 'md' biar form-nya nggak kepanjangan (centered)
            ]);
    }
}
