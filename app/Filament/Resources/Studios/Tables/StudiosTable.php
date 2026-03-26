<?php

namespace App\Filament\Resources\Studios\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StudiosTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nama Studio')
                    ->searchable()
                    ->sortable()
                    ->weight('bold') // Tulisan ditebalkan
                    ->icon('heroicon-o-video-camera'), // Tambah ikon kamera biar manis

                TextColumn::make('capacity')
                    ->label('Kapasitas')
                    ->numeric()
                    ->sortable()
                    ->badge() // Dibikin bentuk label/badge
                    ->color('success') // Kasih warna hijau
                    ->formatStateUsing(fn(string $state): string => $state . ' Kursi'), // Tambahin tulisan 'Kursi' di tabelnya

                TextColumn::make('created_at')
                    ->label('Didaftarkan')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Terakhir Diupdate')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('name', 'asc') // Urutkan otomatis berdasarkan abjad nama studio
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
