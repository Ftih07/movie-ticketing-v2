<?php

namespace App\Filament\Resources\Bookings\Tables;

use App\Models\Booking;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BookingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('booking_code')
                    ->label('Kode Booking')
                    ->searchable()
                    ->weight('bold')
                    ->copyable() // Biar admin gampang nge-copy kode booking kalau ada komplain
                    ->copyMessage('Kode disalin!')
                    ->icon('heroicon-o-ticket'),

                TextColumn::make('user.name')
                    ->label('Pelanggan')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('showtime.movie.title')
                    ->label('Film')
                    ->searchable()
                    ->sortable()
                    ->description(fn(Booking $record): string => \Carbon\Carbon::parse($record->showtime->show_date)->format('d M Y') . ' | ' . \Carbon\Carbon::parse($record->showtime->start_time)->format('H:i')), // Nampilin jadwal tayang kecil di bawah judul film

                TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('IDR', locale: 'id_ID')
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'paid' => 'success',
                        'pending' => 'warning',
                        'failed' => 'danger',
                        'expired' => 'danger',
                        'canceled' => 'gray',
                        default => 'primary',
                    })
                    ->searchable(),

                TextColumn::make('payment_type')
                    ->label('Pembayaran')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true), // Disembunyikan secara default biar tabel nggak kepanjangan

                TextColumn::make('created_at')
                    ->label('Waktu Transaksi')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc') // Wajib: Booking terbaru selalu muncul di atas!
            ->filters([
                //
            ])
            ->recordActions([
                Action::make('markAsPaid')
                    ->label('Tandai Lunas')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Tandai Pembayaran Lunas?')
                    ->modalDescription('Aksi ini akan mengubah status menjadi Paid dan memicu penambahan poin pelanggan. Yakin?')
                    ->visible(fn(Booking $record) => $record->status === 'pending')
                    ->action(function (Booking $record) {
                        // Cukup update statusnya aja, Model Booking otomatis manggil applyPointTransactions!
                        $record->update(['status' => 'paid']);
                    }),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
