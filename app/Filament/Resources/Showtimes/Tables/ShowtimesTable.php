<?php

namespace App\Filament\Resources\Showtimes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Table;

class ShowtimesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // Kita panggil relasi ke tabel movie untuk ambil title-nya
                TextColumn::make('movie.title')
                    ->label('Judul Film')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->icon('heroicon-o-film'), // Kasih icon kecil biar manis

                TextColumn::make('studio.name')
                    ->label('Studio')
                    ->searchable()
                    ->sortable()
                    ->badge() // Dibikin kayak badge biar beda
                    ->color('info'),

                TextColumn::make('show_date')
                    ->label('Tanggal Tayang')
                    ->date('l, d M Y') // Formatnya jadi kayak: Monday, 25 Mar 2026
                    ->sortable(),

                // Kita gabungin Jam Mulai dan Jam Selesai dalam 1 kolom pakai Stack & Split (Opsional, tapi bikin rapi)
                TextColumn::make('time')
                    ->label('Waktu (Mulai - Selesai)')
                    ->getStateUsing(function ($record) {
                        // Mengambil data dan memformatnya, misal: "14:00 - 16:30"
                        return \Carbon\Carbon::parse($record->start_time)->format('H:i') . ' - ' . \Carbon\Carbon::parse($record->end_time)->format('H:i');
                    })
                    ->icon('heroicon-o-clock'),

                TextColumn::make('price')
                    ->label('Harga Tiket')
                    ->money('IDR', locale: 'id_ID') // Format uang Rupiah yang bener
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Dibuat Pada')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('show_date', 'asc') // Default urutin dari jadwal terdekat
            ->filters([
                // Nanti bisa tambah filter berdasarkan tanggal atau studio di sini
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
