<?php

namespace App\Filament\Resources\Showtimes;

use App\Filament\Resources\Showtimes\Pages\CreateShowtime;
use App\Filament\Resources\Showtimes\Pages\EditShowtime;
use App\Filament\Resources\Showtimes\Pages\ListShowtimes;
use App\Filament\Resources\Showtimes\Schemas\ShowtimeForm;
use App\Filament\Resources\Showtimes\Tables\ShowtimesTable;
use App\Models\Showtime;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ShowtimeResource extends Resource
{
    protected static ?string $model = Showtime::class;

    protected static string | \UnitEnum | null $navigationGroup = 'Cinema Management';
    protected static  string| \BackedEnum|null  $navigationIcon = 'heroicon-o-clock';
    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return ShowtimeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ShowtimesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListShowtimes::route('/'),
            'create' => CreateShowtime::route('/create'),
            'edit' => EditShowtime::route('/{record}/edit'),
        ];
    }
}
