<?php

namespace App\Filament\Resources\Categories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'), // Biar nama kategori lebih tegas

                TextColumn::make('description')
                    ->label('Description')
                    ->limit(50) // Membatasi teks jadi 50 karakter biar tabel gak lebar banget
                    ->tooltip(function (TextColumn $column): ?string {
                        return $column->getState();
                    }) // Kalau di-hover mouse, muncul teks full-nya
                    ->wrap() // Kalau masih panjang, dia turun ke bawah (multiline)
                    ->placeholder('No description provided.') // Kalau kosong ada tulisannya
                    ->searchable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
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
