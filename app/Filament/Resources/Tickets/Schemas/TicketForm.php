<?php

namespace App\Filament\Resources\Tickets\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('booking_id')
                    ->required()
                    ->numeric(),
                TextInput::make('seat_code')
                    ->required(),
                TextInput::make('ticket_code')
                    ->required(),
                Select::make('status')
                    ->options(['valid' => 'Valid', 'used' => 'Used'])
                    ->default('valid')
                    ->required(),
            ]);
    }
}
