<?php

namespace App\Filament\Resources\BookingProducts\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use App\Models\BookingProduct;

class BookingProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(1)->schema([
                    Section::make('Ubah Status Pesanan F&B')->schema([
                        // Teks Read-Only buat ngasih konteks ke admin
                        Placeholder::make('booking_code')
                            ->label('Kode Booking')
                            ->content(fn(?BookingProduct $record): string => $record?->booking?->booking_code ?? '-'),

                        Placeholder::make('product_name')
                            ->label('Menu Pesanan')
                            ->content(fn(?BookingProduct $record): string => $record?->product?->name ?? '-'),

                        Placeholder::make('quantity')
                            ->label('Jumlah')
                            ->content(fn(?BookingProduct $record): string => $record ? $record->quantity . ' Porsi' : '-'),

                        // Ini inputan aslinya yang bisa diubah
                        Select::make('status')
                            ->options([
                                'unclaimed' => 'Belum Diambil (Unclaimed)',
                                'claimed' => 'Sudah Diambil (Claimed)',
                            ])
                            ->required()
                            ->label('Status Pengambilan')
                            ->native(false)
                            ->columnSpanFull(),
                    ])->columns(3), // Dibagi 3 biar rapi nyamping
                ])->columnSpan('md'), // Bikin kotak formnya di tengah layar
            ]);
    }
}
