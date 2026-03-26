<?php

namespace App\Filament\Resources\BookingProducts;

use App\Filament\Resources\BookingProducts\Pages\CreateBookingProduct;
use App\Filament\Resources\BookingProducts\Pages\EditBookingProduct;
use App\Filament\Resources\BookingProducts\Pages\ListBookingProducts;
use App\Filament\Resources\BookingProducts\Schemas\BookingProductForm;
use App\Filament\Resources\BookingProducts\Tables\BookingProductsTable;
use App\Models\BookingProduct;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class BookingProductResource extends Resource
{
    protected static ?string $model = BookingProduct::class;

    protected static string | \UnitEnum | null $navigationGroup = 'Ticketing & Sales';
    protected static  string| \BackedEnum|null  $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return BookingProductForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BookingProductsTable::configure($table);
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
            'index' => ListBookingProducts::route('/'),
            'edit' => EditBookingProduct::route('/{record}/edit'),
        ];
    }
}
