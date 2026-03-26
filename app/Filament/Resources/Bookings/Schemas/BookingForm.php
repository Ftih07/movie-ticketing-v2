<?php

namespace App\Filament\Resources\Bookings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;

class BookingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    // KOLOM KIRI (Detail Pesanan)
                    Group::make()->schema([
                        Section::make('Detail Tiket & Pelanggan')->schema([
                            TextInput::make('booking_code')
                                ->label('Kode Booking')
                                ->required()
                                ->maxLength(255)
                                ->extraInputAttributes(['style' => 'font-weight: bold; font-size: 1.2rem; text-transform: uppercase;']), // Bikin hurufnya gede & tebal

                            Select::make('user_id')
                                ->label('Pelanggan')
                                ->relationship('user', 'name')
                                ->required()
                                ->searchable()
                                ->preload(),

                            Select::make('showtime_id')
                                ->label('Jadwal Tayang (Film)')
                                ->relationship('showtime', 'id')
                                // Trik khusus nampilin Judul Film + Tanggal + Jam di dropdown
                                ->getOptionLabelFromRecordUsing(fn($record) => $record->movie->title . ' (' . \Carbon\Carbon::parse($record->show_date)->format('d M Y') . ' | ' . \Carbon\Carbon::parse($record->start_time)->format('H:i') . ')')
                                ->required()
                                ->searchable()
                                ->preload()
                                ->columnSpanFull(),
                        ])->columns(2),
                    ])->columnSpan(['lg' => 2]),

                    // KOLOM KANAN (Pembayaran)
                    Group::make()->schema([
                        Section::make('Pembayaran & Status')->schema([
                            TextInput::make('total_amount')
                                ->label('Total Bayar')
                                ->required()
                                ->numeric()
                                ->prefix('Rp')
                                ->readOnly(), // Biasanya total bayar nggak boleh diedit manual biar nggak selisih pembukuan

                            Select::make('status')
                                ->label('Status Transaksi')
                                ->options([
                                    'pending' => 'Pending (Belum Bayar)',
                                    'paid' => 'Paid (Lunas)',
                                    'failed' => 'Failed (Gagal)',
                                    'expired' => 'Expired (Kedaluwarsa)',
                                    'canceled' => 'Canceled (Dibatalkan)',
                                ])
                                ->default('pending')
                                ->required()
                                ->native(false),

                            TextInput::make('payment_type')
                                ->label('Metode Pembayaran')
                                ->placeholder('Contoh: gopay, bank_transfer, qris')
                                ->default(null),

                            TextInput::make('midtrans_transaction_id')
                                ->label('Midtrans Order ID')
                                ->placeholder('Otomatis dari Midtrans...')
                                ->default(null),
                        ]),
                    ])->columnSpan(['lg' => 1]),
                ])->columnSpanFull()
            ]);
    }
}
