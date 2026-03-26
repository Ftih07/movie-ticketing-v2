<?php

namespace App\Filament\Resources\Promos\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Carbon\Carbon;
use Filament\Tables\Columns\IconColumn;

class PromosTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nama Promo')
                    ->searchable()
                    ->weight('bold')
                    ->description(fn($record) => $record->description), // Nampilin deskripsi promo kecil di bawah nama

                TextColumn::make('code')
                    ->label('Kode Promo')
                    ->searchable()
                    ->badge()
                    ->color('warning')
                    ->copyable()
                    ->copyMessage('Kode promo disalin!')
                    ->icon('heroicon-o-receipt-percent'),

                TextColumn::make('discount_value')
                    ->label('Nilai Diskon')
                    ->formatStateUsing(function ($state, $record) {
                        // Logika pinter buat nampilin format diskon
                        if ($record->discount_type === 'percentage') {
                            $text = $state . '%';
                            // Kalau ada maksimal diskonnya, tampilin juga
                            if ($record->max_discount) {
                                $text .= ' (Max: Rp ' . number_format($record->max_discount, 0, ',', '.') . ')';
                            }
                            return $text;
                        }

                        // Kalau tipenya fixed/nominal
                        return 'Rp ' . number_format($state, 0, ',', '.');
                    })
                    ->sortable(),

                TextColumn::make('quota')
                    ->label('Sisa Kuota')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color(fn($state) => $state === null || $state > 10 ? 'success' : 'danger') // Merah kalau kuota menipis (<= 10)
                    ->formatStateUsing(fn($state) => $state === null ? 'Tanpa Batas' : $state . ' Tiket'), // Kalau null brarti unlimited

                TextColumn::make('period')
                    ->label('Masa Berlaku')
                    ->getStateUsing(function ($record) {
                        $start = \Carbon\Carbon::parse($record->start_date)->format('d M');
                        $end = \Carbon\Carbon::parse($record->end_date)->format('d M Y');
                        return $start . ' - ' . $end;
                    })
                    // 1. Tampilkan teks peringatan kecil di bawah tanggal
                    ->description(fn($record) => $record->end_date < now() ? '⚠️ Sudah Kedaluwarsa' : 'Aktif / Akan Datang')

                    // 2. Ubah warna teks jadi merah kalau udah expired
                    ->color(fn($record) => $record->end_date < now() ? 'danger' : 'gray')
                    ->icon('heroicon-o-calendar'),

                // Jangan lupa import: use Filament\Tables\Columns\IconColumn; di atas file

                IconColumn::make('is_active')
                    ->boolean()
                    ->label('Status Aktif')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                // Filter bisa ditambahkan nanti
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
