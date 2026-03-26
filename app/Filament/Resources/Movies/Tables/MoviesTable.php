<?php

namespace App\Filament\Resources\Movies\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class MoviesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('poster')
                    ->label('Poster')
                    ->disk('public') // <--- TAMBAHIN INI BIAR SAMA KAYAK DI FORM
                    ->circular() // Bikin posternya jadi bulat (kalau mau kotak hapus ini)
                    ->defaultImageUrl(url('/images/placeholder-movie.png')), // Opsional kalau kosong

                TextColumn::make('title')
                    ->label('Judul Film')
                    ->searchable()
                    ->weight('bold') // Tulisan di-bold
                    ->description(fn($record) => $record->director ? 'Dir: ' . $record->director : ''), // Nampilin nama sutradara kecil di bawah judul

                TextColumn::make('categories.name')
                    ->label('Genre')
                    ->badge()
                    ->color('info')
                    ->searchable(),

                TextColumn::make('age')
                    ->label('Rating')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'SU' => 'success',
                        '13+' => 'warning',
                        '17+' => 'danger',
                        '21+' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('duration')
                    ->label('Durasi')
                    ->numeric()
                    ->suffix(' Menit') // Spasi sebelum menit
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Didaftarkan')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc') // Biar film terbaru selalu di atas
            ->filters([
                // Nanti kita bisa tambahin filter kategori di sini
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
