<?php

namespace App\Filament\Resources\BookingProducts\Pages;

use App\Filament\Resources\BookingProducts\BookingProductResource;
use Filament\Resources\Pages\CreateRecord;

class CreateBookingProduct extends CreateRecord
{
    protected static string $resource = BookingProductResource::class;
}
