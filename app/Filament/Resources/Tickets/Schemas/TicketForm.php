<?php

namespace App\Filament\Resources\Tickets\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;

class TicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(1)->schema([
                    Section::make('Detail Tiket')->schema([
                        Select::make('booking_id')
                            ->label('Kode Booking')
                            ->relationship('booking', 'booking_code')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        TextInput::make('ticket_code')
                            ->label('Kode Tiket (Barcode/QR)')
                            ->required()
                            ->extraInputAttributes(['style' => 'font-weight: bold; letter-spacing: 1px;']),

                        TextInput::make('seat_code')
                            ->label('Nomor Kursi')
                            ->placeholder('Contoh: A1, C4, D12')
                            ->required()
                            ->maxLength(10),

                        Select::make('status')
                            ->label('Status Tiket')
                            ->options([
                                'valid' => 'Valid (Belum Dipakai)',
                                'used' => 'Used (Sudah Discan)',
                            ])
                            ->default('valid')
                            ->required()
                            ->native(false),
                    ])->columns(2), // Dibagi 2 kolom (Kode tiket & kursi bersebelahan)
                ])->columnSpan('md'), // Batasi lebar biar terpusat di tengah layar
            ]);
    }
}
