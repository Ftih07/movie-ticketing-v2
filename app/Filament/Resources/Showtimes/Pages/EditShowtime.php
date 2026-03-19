<?php

namespace App\Filament\Resources\Showtimes\Pages;

use App\Filament\Resources\Showtimes\ShowtimeResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditShowtime extends EditRecord
{
    protected static string $resource = ShowtimeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
