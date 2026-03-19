<?php

namespace App\Filament\Resources\Bookings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BookingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->required()
                    ->numeric(),
                TextInput::make('showtime_id')
                    ->required()
                    ->numeric(),
                TextInput::make('booking_code')
                    ->required(),
                TextInput::make('total_amount')
                    ->required()
                    ->numeric(),
                Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                        'failed' => 'Failed',
                        'expired' => 'Expired',
                        'canceled' => 'Canceled',
                    ])
                    ->default('pending')
                    ->required(),
                TextInput::make('payment_type')
                    ->default(null),
                TextInput::make('midtrans_transaction_id')
                    ->default(null),
            ]);
    }
}
