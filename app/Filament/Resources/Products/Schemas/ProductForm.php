<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    // KOLOM KIRI (Porsi 2/3)
                    Group::make()->schema([
                        Section::make('Informasi Produk')->schema([
                            TextInput::make('name')
                                ->required()
                                ->maxLength(255)
                                ->label('Nama Produk')
                                ->placeholder('Contoh: Popcorn Caramel Large'),

                            Select::make('product_category_id')
                                ->relationship('category', 'name')
                                ->required()
                                ->searchable()
                                ->preload()
                                ->label('Kategori'),

                            TextInput::make('price')
                                ->required()
                                ->numeric()
                                ->prefix('Rp')
                                ->step(1000) // Kelipatan seribu biar gampang ngetiknya
                                ->label('Harga'),

                            Textarea::make('description')
                                ->label('Deskripsi')
                                ->rows(4) // Dibikin agak tinggi kotaknya
                                ->placeholder('Jelaskan detail produk, misal: Popcorn manis ukuran besar untuk 2 orang...')
                                ->columnSpanFull(),
                        ])->columns(2), // Dibagi 2 biar inputan nggak terlalu manjang ke kanan
                    ])->columnSpan(['lg' => 2]),

                    // KOLOM KANAN (Porsi 1/3 khusus buat gambar)
                    Group::make()->schema([
                        Section::make('Gambar Produk')->schema([
                            FileUpload::make('image')
                                ->image()
                                ->directory('products')
                                ->disk('public') // Wajib pakai ini
                                ->imageEditor()  // Biar admin bisa potong/crop gambar di web
                                ->label('Upload Gambar')
                                ->hiddenLabel()  // Sembunyiin labelnya karena judul section udah jelas
                                ->columnSpanFull(),
                        ]),
                    ])->columnSpan(['lg' => 1]),
                ])->columnSpanFull() // Biar memenuhi lebar layar
            ]);
    }
}
