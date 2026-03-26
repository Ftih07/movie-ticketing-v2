<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('Foto')
                    ->disk('public') // <--- INI KUNCI BIAR GAMBAR MUNCUL
                    ->circular() // Dibikin bulat biar estetik
                    ->defaultImageUrl(url('/images/placeholder-snack.png')),

                TextColumn::make('name')
                    ->label('Nama Produk')
                    ->searchable()
                    ->weight('bold') // Ditebalkan
                    ->sortable(),

                TextColumn::make('category.name')
                    ->label('Kategori')
                    ->badge() // Dibikin bentuk label/stiker
                    ->color('info')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('price')
                    ->label('Harga')
                    ->money('IDR', locale: 'id_ID') // Otomatis format uang (Rp 15.000,00)
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Didaftarkan')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Diupdate')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('name', 'asc') // Urutkan berdasarkan abjad A-Z
            ->filters([
                // Nanti bisa tambahin filter berdasarkan kategori di sini kalau produknya udah banyak
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
