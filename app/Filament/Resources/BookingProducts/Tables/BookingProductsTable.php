<?php

namespace App\Filament\Resources\BookingProducts\Tables;

use App\Models\BookingProduct;
use Filament\Actions\Action as ActionsAction;
use Filament\Actions\BulkActionGroup as ActionsBulkActionGroup;
use Filament\Actions\DeleteBulkAction as ActionsDeleteBulkAction;
use Filament\Actions\EditAction as ActionsEditAction;
use Filament\Tables\Table;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\Action; // Import untuk custom action 'claim'
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Notifications\Notification;

class BookingProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc') // Biar yang pesen terbaru ada di atas
            ->columns([
                TextColumn::make('booking.booking_code')
                    ->searchable()
                    ->sortable()
                    ->label('Kode Booking')
                    ->weight('bold')
                    ->copyable()
                    ->copyMessage('Kode booking disalin!'),

                TextColumn::make('booking.user.name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Customer'),

                TextColumn::make('product.name')
                    ->searchable()
                    ->sortable()
                    ->label('Pesanan F&B')
                    ->description(fn(BookingProduct $record): string => $record->quantity . 'x Porsi'),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'unclaimed' => 'danger',
                        'claimed' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'unclaimed' => 'Belum Diambil',
                        'claimed' => 'Sudah Diambil',
                        default => $state,
                    })
                    ->label('Status'),

                TextColumn::make('created_at')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->label('Waktu Pesan'),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'unclaimed' => 'Belum Diambil',
                        'claimed' => 'Sudah Diambil',
                    ])
                    ->label('Filter Status'),
            ])
            ->recordActions([
                // Aksi Cepat: Langsung ubah status di tabel jadi 'Claimed'
                ActionsAction::make('claim')
                    ->label('Tandai Diambil')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Konfirmasi Pengambilan')
                    ->modalDescription('Apakah kamu yakin pesanan ini sudah diserahkan ke customer?')
                    ->modalSubmitActionLabel('Ya, Sudah Diserahkan')
                    // Tombol ini cuma muncul kalau statusnya masih 'unclaimed'
                    ->visible(fn(BookingProduct $record): bool => $record->status === 'unclaimed')
                    ->action(function (BookingProduct $record) {
                        $record->update(['status' => 'claimed']);

                        Notification::make()
                            ->title('Berhasil!')
                            ->body('Status pesanan F&B berhasil diubah menjadi Sudah Diambil.')
                            ->success()
                            ->send();
                    }),

                // Edit bawaan Filament
                ActionsEditAction::make(),
            ])
            ->toolbarActions([
                ActionsBulkActionGroup::make([
                    ActionsDeleteBulkAction::make(),
                ]),
            ]);
    }
}
