<?php

namespace App\Filament\Resources\Tickets\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('ticket_code')
                    ->label('Kode Tiket')
                    ->searchable()
                    ->weight('bold')
                    ->icon('heroicon-o-qr-code')
                    ->copyable()
                    ->copyMessage('Kode tiket disalin!'),

                // Menembus relasi: Ticket -> Booking -> User (Ambil namanya)
                TextColumn::make('booking.booking_code')
                    ->label('Ref. Booking')
                    ->searchable()
                    ->sortable()
                    ->description(fn($record) => $record->booking->user->name ?? 'Unknown'), // Teks kecil nama user di bawah kode booking

                // Menembus relasi: Ticket -> Booking -> Showtime -> Movie (Ambil judulnya)
                TextColumn::make('booking.showtime.movie.title')
                    ->label('Film & Jadwal')
                    ->searchable()
                    ->sortable()
                    ->description(fn($record) => \Carbon\Carbon::parse($record->booking->showtime->show_date)->format('d M') . ' | ' . \Carbon\Carbon::parse($record->booking->showtime->start_time)->format('H:i')),

                TextColumn::make('seat_code')
                    ->label('Kursi')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info')
                    ->size('lg'), // Bikin badge kursinya agak gede biar gampang dibaca

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'valid' => 'success', // Hijau kalau masih bisa dipakai
                        'used' => 'danger',   // Merah kalau udah dipakai
                        default => 'gray',
                    })
                    ->searchable(),

                TextColumn::make('created_at')
                    ->label('Dibuat Pada')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                // Filter status bisa ditambahkan di sini nanti
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
