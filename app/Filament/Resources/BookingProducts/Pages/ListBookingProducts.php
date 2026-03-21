<?php

namespace App\Filament\Resources\BookingProducts\Pages;

use App\Filament\Resources\BookingProducts\BookingProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBookingProducts extends ListRecords
{
    protected static string $resource = BookingProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
