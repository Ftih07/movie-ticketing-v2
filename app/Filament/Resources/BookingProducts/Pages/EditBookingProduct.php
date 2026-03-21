<?php

namespace App\Filament\Resources\BookingProducts\Pages;

use App\Filament\Resources\BookingProducts\BookingProductResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBookingProduct extends EditRecord
{
    protected static string $resource = BookingProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
