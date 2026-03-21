<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('product_category_id')
                    ->relationship('category', 'name') // Mengambil relasi dari model Product
                    ->required()
                    ->searchable()
                    ->preload()
                    ->label('Kategori'),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Produk'),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('Rp')
                    ->label('Harga'),
                FileUpload::make('image')
                    ->image()
                    ->directory('products') // Akan disimpan di storage/app/public/products
                    ->disk('public')
                    ->label('Gambar Produk'),
                Textarea::make('description')
                    ->columnSpanFull()
                    ->label('Deskripsi'),
            ]);
    }
}
