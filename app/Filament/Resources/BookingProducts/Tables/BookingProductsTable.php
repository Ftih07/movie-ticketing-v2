<?php

namespace App\Filament\Resources\BookingProducts\Tables;

use App\Models\BookingProduct;
use Filament\Actions\Action as ActionsAction;
use Filament\Actions\BulkActionGroup as ActionsBulkActionGroup;
use Filament\Actions\DeleteBulkAction as ActionsDeleteBulkAction;
use Filament\Actions\EditAction as ActionsEditAction;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Notifications\Notification;

class BookingProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('booking.booking_code')
                    ->searchable()
                    ->sortable()
                    ->label('Kode Booking')
                    ->weight('bold')
                    ->icon('heroicon-o-ticket')
                    ->copyable()
                    ->copyMessage('Kode booking disalin!'),

                TextColumn::make('booking.user.name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Customer'),

                // Tambahan: Munculin foto snack/minumannya
                ImageColumn::make('product.image')
                    ->label('Foto')
                    ->circular()
                    ->disk('public')
                    ->defaultImageUrl(url('/images/placeholder-snack.png')), // Opsional kalau fotonya kosong

                TextColumn::make('product.name')
                    ->searchable()
                    ->sortable()
                    ->label('Pesanan F&B')
                    ->weight('bold') // Ditebalkan biar jelas
                    ->description(fn(BookingProduct $record): string => $record->quantity . ' Porsi | Rp ' . number_format($record->price, 0, ',', '.')), // Gabung qty & harga di bawah nama

                TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'unclaimed' => 'warning', // Ganti kuning aja, kalau merah (danger) biasanya konotasinya "Error/Gagal"
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
                    ->toggleable(isToggledHiddenByDefault: true) // Sembunyikan by default biar gak kepanjangan
                    ->label('Waktu Pesan'),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'unclaimed' => 'Belum Diambil',
                        'claimed' => 'Sudah Diambil',
                    ])
                    ->label('Filter Status')
                    ->native(false),
            ])
            ->recordActions([
                // Custom Action kamu yang keren tadi (Udah aku rapihin dikit)
                ActionsAction::make('claim')
                    ->label('Tandai Diambil')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Konfirmasi Pengambilan')
                    ->modalDescription('Apakah kamu yakin pesanan ini sudah diserahkan ke customer?')
                    ->modalSubmitActionLabel('Ya, Sudah Diserahkan')
                    ->visible(fn(BookingProduct $record): bool => $record->status === 'unclaimed')
                    ->action(function (BookingProduct $record) {
                        $record->update(['status' => 'claimed']);

                        Notification::make()
                            ->title('Berhasil!')
                            ->body('Status pesanan F&B berhasil diubah menjadi Sudah Diambil.')
                            ->success()
                            ->send();
                    }),

                ActionsEditAction::make(),
            ])
            ->toolbarActions([
                ActionsBulkActionGroup::make([
                    ActionsDeleteBulkAction::make(),
                ]),
            ]);
    }
}
