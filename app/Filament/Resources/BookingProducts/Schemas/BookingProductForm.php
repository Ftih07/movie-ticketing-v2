<?php

namespace App\Filament\Resources\BookingProducts\Schemas;

use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class BookingProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('status')
                    ->options([
                        'unclaimed' => 'Belum Diambil (Unclaimed)',
                        'claimed' => 'Sudah Diambil (Claimed)',
                    ])
                    ->required()
                    ->label('Status Pengambilan'),
            ]);
    }
}
